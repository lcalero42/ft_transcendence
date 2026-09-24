import { Logger } from '@nestjs/common';
import {
  Room,
  type Client,
  type AuthContext,
  matchMaker,
} from '@colyseus/core';
import { UndercoverState, Player, ChatMessage } from './UndercoverState';

export interface JoinOptions {
  name?: string;
  avatarUrl?: string;
}

interface SeatTransferAuth {
  isHost?: boolean;
  token?: string;
}

interface WordPair {
  civilianWord: string;
  undercoverWord: string;
}

type Role = 'civilian' | 'undercover';

const MIN_PARTICIPANTS = 3;
const MAX_PARTICIPANTS = 6;
const MAX_CLIENTS = 12;
const MAX_CHAT_HISTORY = 100;
const MAX_CHAT_MESSAGE_LENGTH = 300;
const RECONNECTION_WINDOW_SECONDS = 20;
const MAX_ROOM_NAME_LENGTH = 16;
const API_URL = `http://localhost:${process.env.PORT ?? 3000}`;

export class UndercoverRoom extends Room {
  maxClients = MAX_CLIENTS;
  state = new UndercoverState();

  private readonly logger = new Logger('UndercoverRoom');
  private wordPair: WordPair | null = null;
  private roles = new Map<string, Role>();

  messages = {
    start: async (client: Client) => {
      if (!this.isHost(client) || this.state.phase !== 'setup') {
        return;
      }
      this.state.phase = 'open';
      await this.setPrivate(false);
      await this.saveRoom(client);

      const roomCache = await matchMaker.getRoomById(this.roomId);
      for (const [sessionId, player] of this.state.players.entries()) {
        const auth: SeatTransferAuth = {
          isHost: sessionId === this.state.hostSessionId,
        };
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

    startGame: async (client: Client) => {
      if (
        !this.isHost(client) ||
        this.state.phase !== 'open' ||
        this.state.participants.length < this.state.minParticipants
      ) {
        return;
      }
      const pair = await this.fetchWordPair();
      if (!pair) {
        this.logger.warn('no word pair available, game not started');
        return;
      }
      this.wordPair = pair;
      this.assignRoles();
      this.state.phase = 'playing';
      for (const sessionId of this.state.participants) {
        this.sendWord(sessionId);
      }
      this.logger.log(
        `game started with ${this.state.participants.length} participants`,
      );
    },

    getWord: (client: Client) => {
      if (this.state.phase === 'playing') {
        this.sendWord(client.sessionId);
      }
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

  onAuth(_client: Client, _options: JoinOptions, context: AuthContext) {
    const auth: SeatTransferAuth = { token: context.token };
    return auth;
  }

  onJoin(client: Client, options?: JoinOptions) {
    this.logger.log('room joined');
    const player = new Player();
    player.name = options?.name?.trim() || 'Player';
    player.avatarUrl = options?.avatarUrl?.trim() || '';
    this.state.players.set(client.sessionId, player);

    const auth = client.auth as SeatTransferAuth | undefined;
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
  }

  onDispose() {
    this.logger.log('room disposed');
  }

  private async saveRoom(host: Client) {
    const token = (host.auth as SeatTransferAuth | undefined)?.token;
    if (!token) {
      this.logger.warn('host has no token, room not saved');
      return;
    }
    const hostName = this.state.players.get(host.sessionId)?.name ?? '';
    try {
      const res = await fetch(`${API_URL}/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: hostName.slice(0, MAX_ROOM_NAME_LENGTH),
          colyseusRoomId: this.roomId,
        }),
      });
      if (!res.ok) {
        this.logger.warn(`could not save room: ${res.status}`);
      }
    } catch (error) {
      this.logger.warn(`could not save room: ${String(error)}`);
    }
  }

  private async fetchWordPair(): Promise<WordPair | null> {
    try {
      const res = await fetch(`${API_URL}/word-pair`);
      if (!res.ok) {
        this.logger.warn(`could not fetch word pairs: ${res.status}`);
        return null;
      }
      const pairs = (await res.json()) as WordPair[];
      if (pairs.length === 0) {
        return null;
      }
      const { civilianWord, undercoverWord } =
        pairs[Math.floor(Math.random() * pairs.length)];
      return { civilianWord, undercoverWord };
    } catch (error) {
      this.logger.warn(`could not fetch word pairs: ${String(error)}`);
      return null;
    }
  }

  private assignRoles() {
    const participants = [...this.state.participants];
    const undercoverIndex = Math.floor(Math.random() * participants.length);
    this.roles.clear();
    participants.forEach((sessionId, index) => {
      this.roles.set(
        sessionId,
        index === undercoverIndex ? 'undercover' : 'civilian',
      );
    });
  }

  private sendWord(sessionId: string) {
    const role = this.roles.get(sessionId);
    if (!role || !this.wordPair) {
      return;
    }
    const word =
      role === 'undercover'
        ? this.wordPair.undercoverWord
        : this.wordPair.civilianWord;
    this.clients.getById(sessionId)?.send('word', { word });
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

  private finishGame() {
    this.state.phase = 'open';
    this.state.participants.clear();
    this.wordPair = null;
    this.roles.clear();
  }
}
