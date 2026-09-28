import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Room, type Client, matchMaker } from '@colyseus/core';
import { UndercoverState, Player, ChatMessage } from './UndercoverState';
import { requireEnv } from '../../common/require-env';
import { softDeleteGuest } from '../../player/soft-delete-guest';
import { prisma } from '../prisma';

export interface JoinOptions {
  name?: string;
  avatarUrl?: string;
}

interface PlayerIdentity {
  playerId: number;
  isGuest: boolean;
}

interface SeatTransferAuth extends PlayerIdentity {
  isHost: boolean;
}

const jwtService = new JwtService({ secret: requireEnv('JWT_SECRET') });

const MIN_PARTICIPANTS = 3;
const MAX_PARTICIPANTS = 6;
const MAX_CLIENTS = 12;
const MAX_CHAT_HISTORY = 100;
const MAX_CHAT_MESSAGE_LENGTH = 300;
const RECONNECTION_WINDOW_SECONDS = 20;

export class UndercoverRoom extends Room {
  maxClients = MAX_CLIENTS;
  state = new UndercoverState();

  private readonly logger = new Logger('UndercoverRoom');
  private readonly identities = new Map<string, PlayerIdentity>();
  private readonly pendingHandoffs = new Map<number, PlayerIdentity>();

  messages = {
    start: async (client: Client) => {
      if (!this.isHost(client) || this.state.phase !== 'setup') {
        return;
      }
      this.state.phase = 'open';
      await this.setPrivate(false);

      const roomCache = await matchMaker.getRoomById(this.roomId);
      for (const [sessionId, player] of this.state.players.entries()) {
        const identity = this.identities.get(sessionId);
        if (!identity) {
          continue;
        }
        const auth: SeatTransferAuth = {
          ...identity,
          isHost: sessionId === this.state.hostSessionId,
        };
        this.pendingHandoffs.set(identity.playerId, identity);
        try {
          const reservation = await matchMaker.reserveSeatFor(
            roomCache,
            { name: player.name, avatarUrl: player.avatarUrl },
            auth,
          );
          this.clients.getById(sessionId)?.send('seatReservation', reservation);
        } catch (error) {
          this.logger.warn(
            `could not reserve a seat for ${sessionId}: ${String(error)}`,
          );
        }
      }
      this.clock.setTimeout(
        () => this.expireHandoffs(),
        this.seatReservationTimeout * 1000,
      );
    },

    chat: (client: Client, text: unknown) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || typeof text !== 'string') {
        return;
      }
      const trimmed = text.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH);
      if (!trimmed) {
        return;
      }

      const message = new ChatMessage();
      message.sessionId = client.sessionId;
      message.name = player.name;
      message.text = trimmed;
      message.sentAt = Date.now();
      this.state.chat.push(message);

      if (this.state.chat.length > MAX_CHAT_HISTORY) {
        this.state.chat.shift();
      }
    },

    joinGame: (client: Client) => {
      const { participants } = this.state;
      if (
        this.state.phase !== 'open' ||
        participants.includes(client.sessionId) ||
        participants.length >= this.state.maxParticipants
      ) {
        return;
      }
      participants.push(client.sessionId);
    },

    leaveGame: (client: Client) => {
      if (this.state.phase !== 'open') {
        return;
      }
      this.removeParticipant(client.sessionId);
    },

    startGame: (client: Client) => {
      if (
        !this.isHost(client) ||
        this.state.phase !== 'open' ||
        this.state.participants.length < this.state.minParticipants
      ) {
        return;
      }
      this.state.phase = 'playing';
      this.logger.log(
        `game started with ${this.state.participants.length} participants`,
      );
    },

    endGame: (client: Client) => {
      if (!this.isHost(client) || this.state.phase !== 'playing') {
        return;
      }
      this.finishGame();
    },
  };

  async onCreate() {
    this.logger.log('room created');
    this.state.minParticipants = MIN_PARTICIPANTS;
    this.state.maxParticipants = MAX_PARTICIPANTS;
    await this.setPrivate(true);
  }

  static async onAuth(token: string): Promise<PlayerIdentity> {
    if (!token) {
      throw new Error('missing token');
    }
    const payload = await jwtService.verifyAsync<{ sub: number }>(token);
    const player = await prisma.player.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, isGuest: true },
    });
    if (!player) {
      throw new Error('player not found');
    }
    return { playerId: player.id, isGuest: player.isGuest };
  }

  onJoin(client: Client, options?: JoinOptions) {
    this.logger.log('room joined');
    const auth = client.auth as PlayerIdentity & Partial<SeatTransferAuth>;
    this.identities.set(client.sessionId, {
      playerId: auth.playerId,
      isGuest: auth.isGuest,
    });
    this.pendingHandoffs.delete(auth.playerId);

    const player = new Player();
    player.name = options?.name?.trim() || 'Player';
    player.avatarUrl = options?.avatarUrl?.trim() || '';
    this.state.players.set(client.sessionId, player);

    if (auth.isHost || !this.state.hostSessionId) {
      this.state.hostSessionId = client.sessionId;
    }
  }

  onDrop(client: Client) {
    this.logger.log('room connection dropped, awaiting reconnection');
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = false;
    }

    this.allowReconnection(client, RECONNECTION_WINDOW_SECONDS).catch(
      (reason: unknown) => {
        this.logger.log(
          reason === false
            ? 'reconnection window expired'
            : `reconnection not possible: ${reason instanceof Error ? reason.message : String(reason)}`,
        );
      },
    );
  }

  onReconnect(client: Client) {
    this.logger.log('room reconnected');
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = true;
    }
  }

  onLeave(client: Client) {
    this.logger.log('room left');
    this.state.players.delete(client.sessionId);
    this.removeParticipant(client.sessionId);

    if (
      this.state.phase === 'playing' &&
      this.state.participants.length < this.state.minParticipants
    ) {
      this.logger.log('not enough participants left, ending game');
      this.finishGame();
    }

    if (this.state.hostSessionId === client.sessionId) {
      const [nextHost] = Array.from(this.state.players.keys());
      this.state.hostSessionId = nextHost ?? '';
    }

    const identity = this.identities.get(client.sessionId);
    this.identities.delete(client.sessionId);
    if (identity) {
      this.cleanupGuestIfGone(identity);
    }
  }

  onDispose() {
    this.logger.log('room disposed');
  }

  private isHost(client: Client) {
    return client.sessionId === this.state.hostSessionId;
  }

  private removeParticipant(sessionId: string) {
    const index = this.state.participants.indexOf(sessionId);
    if (index !== -1) {
      this.state.participants.splice(index, 1);
    }
  }

  private expireHandoffs() {
    const expired = Array.from(this.pendingHandoffs.values());
    this.pendingHandoffs.clear();
    for (const identity of expired) {
      this.cleanupGuestIfGone(identity);
    }
  }

  private cleanupGuestIfGone({ playerId, isGuest }: PlayerIdentity) {
    if (!isGuest || this.pendingHandoffs.has(playerId)) {
      return;
    }
    for (const identity of this.identities.values()) {
      if (identity.playerId === playerId) {
        return;
      }
    }
    softDeleteGuest(prisma, playerId).catch((error: unknown) => {
      this.logger.warn(
        `could not clean up guest ${playerId}: ${String(error)}`,
      );
    });
  }

  private finishGame() {
    this.state.phase = 'open';
    this.state.participants.clear();
  }
}
