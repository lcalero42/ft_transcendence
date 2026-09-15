import { Logger } from '@nestjs/common';
import { Room, type Client, matchMaker } from '@colyseus/core';
import { UndercoverState, Player, ChatMessage } from './UndercoverState';

export interface JoinOptions {
  name?: string;
  avatarUrl?: string;
}

// Server-side only data attached to the seat reservations sent on `start`
interface SeatTransferAuth {
  isHost: boolean;
}

const MIN_PARTICIPANTS = 3;
const MAX_PARTICIPANTS = 6;
// Participants plus spectators
const MAX_CLIENTS = 12;
const MAX_CHAT_HISTORY = 100;
const MAX_CHAT_MESSAGE_LENGTH = 300;
const RECONNECTION_WINDOW_SECONDS = 20;

export class UndercoverRoom extends Room {
  maxClients = MAX_CLIENTS;
  state = new UndercoverState();

  private readonly logger = new Logger('UndercoverRoom');

  messages = {
    // Host is done inviting: the room becomes listed and anyone can join it.
    // The front switches page (which drops the connection), so every player
    // gets a seat reservation in this same room to rejoin with.
    start: async (client: Client) => {
      if (!this.isHost(client) || this.state.phase !== 'setup') {
        return;
      }
      this.state.phase = 'open';
      await this.setPrivate(false);

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
          // Reserved seats count towards maxClients
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
      // TODO: pick a word pair, assign roles and send each participant
      // their word privately with client.send() (never through the state)
    },

    // Temporary until the game loop decides by itself when a game is over
    endGame: (client: Client) => {
      if (!this.isHost(client) || this.state.phase !== 'playing') {
        return;
      }
      this.finishGame();
    },
  };

  // Called when the room is created
  async onCreate() {
    this.logger.log('room created');
    this.state.minParticipants = MIN_PARTICIPANTS;
    this.state.maxParticipants = MAX_PARTICIPANTS;
    // Only reachable through the invite link until the host launches it
    await this.setPrivate(true);
  }

  // Called when a client joins the room
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

  // Called when a client disconnects without leaving on purpose (e.g. page refresh, dropped connection)
  onDrop(client: Client) {
    this.logger.log('room connection dropped, awaiting reconnection');
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = false;
    }
    this.allowReconnection(client, RECONNECTION_WINDOW_SECONDS);
  }

  // Called when a dropped client successfully reconnects
  onReconnect(client: Client) {
    this.logger.log('room reconnected');
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = true;
    }
  }

  // Called when a client permanently leaves the room (consented leave, or reconnection window expired)
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

  // Called when the room is disposed
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

  // Back to the chat, everyone has to register again for the next game
  private finishGame() {
    this.state.phase = 'open';
    this.state.participants.clear();
  }
}
