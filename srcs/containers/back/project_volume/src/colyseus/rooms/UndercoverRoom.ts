import { Logger } from '@nestjs/common';
import { Room, type Client, type Delayed, matchMaker } from '@colyseus/core';
import { UndercoverState, Player } from './UndercoverState';
import { assignRoles } from './undercoverGameLogic';
import {
  MIN_PARTICIPANTS,
  MAX_PARTICIPANTS,
  MAX_CLIENTS,
  RECONNECTION_WINDOW_SECONDS,
  EMPTY_ROOM_GRACE_SECONDS,
  TAKEN_OVER_CODE,
  KICKED_CODE,
} from './undercoverConstants';
import {
  addParticipant,
  removeParticipant,
  addChatMessage,
} from './undercoverLobby';
import { UndercoverGame } from './UndercoverGame';
import { RoomPersistence } from './RoomPersistence';
import { getPlayerId, fetchWordPair, areFriends } from '../api';
import { notifyPlayer, notifyAll } from '../presence-pubsub';
import { prisma } from '../prisma';

export interface JoinOptions {
  name?: string;
  avatarUrl?: string;
  lang?: string;
}

interface PlayerIdentity {
  playerId: number;
  isGuest: boolean;
  token: string;
}

interface SeatTransferAuth extends PlayerIdentity {
  isHost?: boolean;
}

export class UndercoverRoom extends Room {
  maxClients = MAX_CLIENTS;
  state = new UndercoverState();

  private readonly logger = new Logger('UndercoverRoom');
  private readonly persistence = new RoomPersistence();
  private readonly game = new UndercoverGame(this, this.persistence);
  private readonly identities = new Map<string, PlayerIdentity>();
  private readonly pendingHandoffs = new Set<number>();
  private readonly forcedOutSessions = new Set<string>();
  private readonly pendingReconnections = new Map<
    string,
    ReturnType<Room['allowReconnection']>
  >();
  private emptyRoomTimer: Delayed | null = null;
  private starting = false;

  messages = {
    start: async (client: Client) => {
      if (!this.isHost(client) || this.state.phase !== 'setup') {
        return;
      }
      this.state.phase = 'open';
      const roomName = this.state.players.get(client.sessionId)?.name ?? '';
      const saved = await this.persistence.saveRoom(
        this.identities.get(client.sessionId)?.token,
        roomName + "'s room",
        this.roomId,
      );
      if (!saved) {
        this.state.phase = 'setup';
        client.send('startError', { code: 'NOT_SAVED' });
        return;
      }
      await this.setPrivate(false);
      notifyAll('roomsChanged');
      await this.transferSeats();
    },

    inviteFriend: async (client: Client, payload: { friendId?: unknown }) => {
      const reply = (code?: string) =>
        client.send('inviteResult', { ok: !code, code });
      const friendId = payload?.friendId;
      const sender = this.state.players.get(client.sessionId);
      const token = (client.auth as SeatTransferAuth | undefined)?.token;
      if (typeof friendId !== 'number' || !sender || !token) {
        return reply('INVALID_REQUEST');
      }
      if (this.state.phase !== 'setup') {
        return reply('GAME_STARTED');
      }
      if (this.state.players.size >= this.state.maxParticipants) {
        return reply('ROOM_FULL');
      }
      const alreadyIn = [...this.state.players.values()].some(
        (p) => p.playerId === friendId,
      );
      if (alreadyIn) {
        return reply('ALREADY_IN_ROOM');
      }
      if (!(await areFriends(token, friendId))) {
        return reply('NOT_FRIEND');
      }
      const delivered = notifyPlayer(friendId, 'roomInvite', {
        roomId: this.roomId,
        fromName: sender.name,
      });
      reply(delivered ? undefined : 'FRIEND_UNAVAILABLE');
    },

    chat: (client: Client, text: unknown) => {
      addChatMessage(this.state, client.sessionId, text);
    },

    joinGame: (client: Client) => {
      addParticipant(this.state, client.sessionId);
    },

    leaveGame: (client: Client) => {
      if (this.state.phase !== 'open') {
        return;
      }
      removeParticipant(this.state, client.sessionId);
    },

    startGame: async (client: Client) => {
      if (
        this.starting ||
        !this.isHost(client) ||
        this.state.phase !== 'open' ||
        this.state.participants.length < this.state.minParticipants
      ) {
        return;
      }
      this.starting = true;
      try {
        const pair = await fetchWordPair();
        if (!pair) {
          this.logger.warn('no word pair available, game not started');
          client.send('startError', { code: 'NO_WORD_PAIR' });
          return;
        }
        const roles = assignRoles([...this.state.participants]);
        if (!(await this.persistence.saveGame(pair, roles))) {
          this.logger.warn('could not save game, game not started');
          client.send('startError', { code: 'NOT_SAVED' });
          return;
        }
        this.game.start(pair, roles);
      } finally {
        this.starting = false;
      }
    },

    getWord: (client: Client, lang: unknown) => {
      this.game.setLanguage(client.sessionId, lang);
      if (this.game.isRunning()) {
        this.game.sendWord(client.sessionId);
      }
    },

    submitClue: (client: Client, word: unknown) => {
      this.game.submitClue(client.sessionId, word);
    },

    castVote: (client: Client, targetSessionId: unknown) => {
      this.game.castVote(client.sessionId, targetSessionId);
    },

    kick: (client: Client, targetSessionId: unknown) => {
      if (
        !this.isHost(client) ||
        typeof targetSessionId !== 'string' ||
        targetSessionId === client.sessionId ||
        !this.state.players.has(targetSessionId)
      ) {
        return;
      }
      this.forceOut(targetSessionId, KICKED_CODE, 'kicked');
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
    const playerId = await getPlayerId(token);
    if (!playerId) {
      throw new Error('invalid token');
    }
    const player = await prisma.player.findUnique({
      where: { id: playerId, deletedAt: null },
      select: { id: true, isGuest: true },
    });
    if (!player) {
      throw new Error('player not found');
    }
    return { playerId: player.id, isGuest: player.isGuest, token };
  }

  onJoin(client: Client, options?: JoinOptions) {
    this.logger.log('room joined');
    this.cancelEmptyRoomTimer();
    const auth = client.auth as SeatTransferAuth;
    const previousSessionId = this.pendingHandoffs.has(auth.playerId)
      ? undefined
      : this.findSession(auth.playerId);
    this.identities.set(client.sessionId, {
      playerId: auth.playerId,
      isGuest: auth.isGuest,
      token: auth.token,
    });
    this.persistence.trackPlayer(client.sessionId, auth.playerId);
    this.game.setLanguage(client.sessionId, options?.lang);
    this.pendingHandoffs.delete(auth.playerId);

    if (previousSessionId) {
      this.takeOverSession(previousSessionId, client.sessionId);
      return;
    }

    const player = new Player();
    player.name = options?.name?.trim() || 'Player';
    player.avatarUrl = options?.avatarUrl?.trim() || '';
    player.isGuest = auth.isGuest;
    player.playerId = auth?.playerId ?? 0;
    this.state.players.set(client.sessionId, player);

    if (auth.isHost || !this.state.hostSessionId) {
      this.state.hostSessionId = client.sessionId;
    }
    void this.publishPlayerCount();
  }

  onDrop(client: Client) {
    if (this.forcedOutSessions.delete(client.sessionId)) {
      return;
    }
    this.logger.log('room connection dropped, awaiting reconnection');
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = false;
    }

    const reconnection = this.allowReconnection(
      client,
      RECONNECTION_WINDOW_SECONDS,
    );
    this.pendingReconnections.set(client.sessionId, reconnection);
    reconnection.catch((reason: unknown) => {
      this.pendingReconnections.delete(client.sessionId);
      this.logger.log(
        reason === false
          ? 'reconnection window expired'
          : `reconnection not possible: ${reason instanceof Error ? reason.message : String(reason)}`,
      );
    });

    if (this.clients.length === 0) {
      this.cancelEmptyRoomTimer();
      this.emptyRoomTimer = this.clock.setTimeout(
        () => this.closeIfEmpty(),
        EMPTY_ROOM_GRACE_SECONDS * 1000,
      );
    }
  }

  onReconnect(client: Client) {
    this.logger.log('room reconnected');
    this.cancelEmptyRoomTimer();
    this.pendingReconnections.delete(client.sessionId);
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = true;
    }
  }

  onLeave(client: Client) {
    this.logger.log('room left');
    this.state.players.delete(client.sessionId);
    removeParticipant(this.state, client.sessionId);

    if (this.game.isRunning()) {
      this.game.removePlayer(client.sessionId);
    }

    if (this.state.hostSessionId === client.sessionId) {
      const [nextHost] = Array.from(this.state.players.keys());
      this.state.hostSessionId = nextHost ?? '';
    }

    this.identities.delete(client.sessionId);
    this.persistence.forgetPlayer(client.sessionId);
    this.game.forgetLanguage(client.sessionId);
    void this.publishPlayerCount();
  }

  async onDispose() {
    this.logger.log('room disposed');
    await this.persistence.close();
    notifyAll('roomsChanged');
  }

  private async publishPlayerCount() {
    await this.setMetadata({ playerCount: this.state.players.size });
    if (this.state.phase !== 'setup') {
      notifyAll('roomsChanged');
    }
  }

  private cancelEmptyRoomTimer() {
    this.emptyRoomTimer?.clear();
    this.emptyRoomTimer = null;
  }

  private closeIfEmpty() {
    this.emptyRoomTimer = null;
    if (this.clients.length > 0) {
      return;
    }
    this.logger.log('room empty, closing without waiting for reconnections');
    for (const reconnection of this.pendingReconnections.values()) {
      const reject = reconnection.reject as (reason: Error) => void;
      reject(new Error('room empty'));
    }
    this.pendingReconnections.clear();
  }

  private async transferSeats() {
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
      this.pendingHandoffs.add(identity.playerId);
      try {
        const reservation = await matchMaker.reserveSeatFor(
          roomCache,
          {
            name: player.name,
            avatarUrl: player.avatarUrl,
            lang: this.game.getLanguage(sessionId),
          },
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
      () => this.pendingHandoffs.clear(),
      this.seatReservationTimeout * 1000,
    );
  }

  private findSession(playerId: number) {
    for (const [sessionId, identity] of this.identities) {
      if (identity.playerId === playerId) {
        return sessionId;
      }
    }
    return undefined;
  }

  private takeOverSession(oldId: string, newId: string) {
    this.logger.log('seat taken over by a new session');
    const previous = this.state.players.get(oldId);
    const player = previous ? previous.clone() : new Player();
    player.connected = true;
    this.state.players.delete(oldId);
    this.state.players.set(newId, player);

    const { state } = this;
    for (const list of [state.participants, state.alive, state.turnOrder]) {
      const index = list.indexOf(oldId);
      if (index !== -1) {
        list.splice(index, 1, newId);
      }
    }
    for (const vote of state.votes) {
      if (vote.voterSessionId === oldId) vote.voterSessionId = newId;
      if (vote.targetSessionId === oldId) vote.targetSessionId = newId;
    }
    for (const entry of [...state.clues, ...state.chat]) {
      if (entry.sessionId === oldId) entry.sessionId = newId;
    }
    for (const record of state.eliminationHistory) {
      if (record.eliminatedSessionId === oldId) {
        record.eliminatedSessionId = newId;
      }
    }
    const revealedRole = state.revealedRoles.get(oldId);
    if (revealedRole !== undefined) {
      state.revealedRoles.delete(oldId);
      state.revealedRoles.set(newId, revealedRole);
    }
    this.game.renameSession(oldId, newId);
    if (state.hostSessionId === oldId) {
      state.hostSessionId = newId;
    }
    this.identities.delete(oldId);
    this.persistence.forgetPlayer(oldId);
    this.game.forgetLanguage(oldId);

    this.forceOut(oldId, TAKEN_OVER_CODE, 'seat taken over');
  }

  private forceOut(sessionId: string, code: number, reason: string) {
    const reconnection = this.pendingReconnections.get(sessionId);
    this.pendingReconnections.delete(sessionId);
    if (reconnection) {
      const reject = reconnection.reject as (reason: Error) => void;
      reject(new Error(reason));
      return;
    }
    const target = this.clients.getById(sessionId);
    if (target) {
      this.forcedOutSessions.add(sessionId);
      target.leave(code);
    }
  }

  private isHost(client: Client) {
    return client.sessionId === this.state.hostSessionId;
  }
}
