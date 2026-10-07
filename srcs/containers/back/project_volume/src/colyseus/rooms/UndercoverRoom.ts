import { Logger } from '@nestjs/common';
import {
  Room,
  type Client,
  type AuthContext,
  matchMaker,
  ServerError,
} from '@colyseus/core';
import { UndercoverState, Player } from './UndercoverState';
import { assignRoles } from './undercoverGameLogic';
import {
  MIN_PARTICIPANTS,
  MAX_PARTICIPANTS,
  MAX_CLIENTS,
  RECONNECTION_WINDOW_SECONDS,
} from './undercoverConstants';
import {
  addParticipant,
  removeParticipant,
  addChatMessage,
} from './undercoverLobby';
import { UndercoverGame } from './UndercoverGame';
import { RoomPersistence } from './RoomPersistence';
import { getPlayerId, fetchWordPair } from '../api';

export interface JoinOptions {
  name?: string;
  avatarUrl?: string;
  lang?: string;
}

interface SeatTransferAuth {
  isHost?: boolean;
  token?: string;
  playerId?: number;
}

export class UndercoverRoom extends Room {
  maxClients = MAX_CLIENTS;
  state = new UndercoverState();

  private readonly logger = new Logger('UndercoverRoom');
  private readonly persistence = new RoomPersistence();
  private readonly game = new UndercoverGame(this, this.persistence);

  messages = {
    start: async (client: Client) => {
      if (!this.isHost(client) || this.state.phase !== 'setup') {
        return;
      }
      this.state.phase = 'open';
      await this.setPrivate(false);
      const roomName = this.state.players.get(client.sessionId)?.name ?? '';
      await this.persistence.saveRoom(
        (client.auth as SeatTransferAuth | undefined)?.token,
        roomName + "'s room",
        this.roomId,
      );
      await this.transferSeats();
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
        !this.isHost(client) ||
        this.state.phase !== 'open' ||
        this.state.participants.length < this.state.minParticipants
      ) {
        return;
      }
      const pair = await fetchWordPair();
      if (!pair) {
        this.logger.warn('no word pair available, game not started');
        return;
      }
      const roles = assignRoles([...this.state.participants]);
      if (!(await this.persistence.saveGame(pair, roles))) {
        this.logger.warn('could not save game, game not started');
        return;
      }
      this.game.start(pair, roles);
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
  };

  async onCreate() {
    this.logger.log('room created');
    this.state.minParticipants = MIN_PARTICIPANTS;
    this.state.maxParticipants = MAX_PARTICIPANTS;
    await this.setPrivate(true);
  }

  async onAuth(_client: Client, _options: JoinOptions, context: AuthContext) {
    const { token } = context;
    if (!token) {
      return {};
    }
    const playerId = await getPlayerId(token);
    if (!playerId) {
      throw new ServerError(401, 'invalid token');
    }
    const auth: SeatTransferAuth = { token, playerId };
    return auth;
  }

  onJoin(client: Client, options?: JoinOptions) {
    this.logger.log('room joined');
    const auth = client.auth as SeatTransferAuth | undefined;
    this.persistence.trackPlayer(client.sessionId, auth?.playerId);
    this.game.setLanguage(client.sessionId, options?.lang);

    const player = new Player();
    player.name = options?.name?.trim() || 'Player';
    player.avatarUrl = options?.avatarUrl?.trim() || '';
    this.state.players.set(client.sessionId, player);

    if (auth?.isHost || !this.state.hostSessionId) {
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
    removeParticipant(this.state, client.sessionId);

    if (this.game.isRunning()) {
      this.game.removePlayer(client.sessionId);
    }

    if (this.state.hostSessionId === client.sessionId) {
      const [nextHost] = Array.from(this.state.players.keys());
      this.state.hostSessionId = nextHost ?? '';
    }
    this.persistence.forgetPlayer(client.sessionId);
    this.game.forgetLanguage(client.sessionId);
  }

  async onDispose() {
    this.logger.log('room disposed');
    await this.persistence.close();
  }

  private async transferSeats() {
    const roomCache = await matchMaker.getRoomById(this.roomId);
    for (const [sessionId, player] of this.state.players.entries()) {
      const auth: SeatTransferAuth = {
        isHost: sessionId === this.state.hostSessionId,
        playerId: this.persistence.getPlayerId(sessionId),
      };
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
  }

  private isHost(client: Client) {
    return client.sessionId === this.state.hostSessionId;
  }
}
