import { Logger } from '@nestjs/common';
import { ArraySchema } from '@colyseus/schema';
import {
  Room,
  type Client,
  type AuthContext,
  type Delayed,
  matchMaker,
} from '@colyseus/core';
import {
  UndercoverState,
  Player,
  ChatMessage,
  Clue,
  Vote,
  EliminationRecord,
  type RoomPhase,
} from './UndercoverState';
import {
  assignRoles,
  buildTurnOrder,
  tallyVotes,
  checkWinCondition,
  type Role,
} from './undercoverGameLogic';

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

const MIN_PARTICIPANTS = 3;
const MAX_PARTICIPANTS = 6;
const MAX_CLIENTS = 12;
const MAX_CHAT_HISTORY = 100;
const MAX_CHAT_MESSAGE_LENGTH = 300;
const MAX_CLUE_LENGTH = 60;
const STARTING_DURATION_MS = 5000;
const TURN_DURATION_MS = 60000;
const VOTING_DURATION_MS = 30000;
const REVEAL_DURATION_MS = 5000;
const FINISHED_DURATION_MS = 5000;
const RECONNECTION_WINDOW_SECONDS = 20;
const MAX_ROOM_NAME_LENGTH = 16;
const API_URL = `http://localhost:${process.env.PORT ?? 3000}`;
const ROUND_PHASES: RoomPhase[] = [
  'starting',
  'describing',
  'voting',
  'reveal',
];

export class UndercoverRoom extends Room {
  maxClients = MAX_CLIENTS;
  state = new UndercoverState();

  private readonly logger = new Logger('UndercoverRoom');
  private wordPair: WordPair | null = null;
  private roles = new Map<string, Role>();
  private phaseTimer: Delayed | null = null;

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
      this.roles = assignRoles([...this.state.participants]);
      for (const sessionId of this.state.participants) {
        this.sendWord(sessionId);
      }

      this.state.round = 1;
      this.state.alive = new ArraySchema(...this.state.participants);
      this.state.turnOrder.clear();
      this.state.currentTurnIndex = 0;
      this.state.clues.clear();
      this.state.votes.clear();
      this.state.eliminationHistory.clear();
      this.state.winner = '';
      this.state.revealedRoles.clear();
      this.setPhase('starting', STARTING_DURATION_MS, () => this.beginRound());

      this.logger.log(
        `game started with ${this.state.participants.length} participants`,
      );
    },

    getWord: (client: Client) => {
      if (ROUND_PHASES.includes(this.state.phase)) {
        this.sendWord(client.sessionId);
      }
    },

    submitClue: (client: Client, word: unknown) => {
      if (
        this.state.phase !== 'describing' ||
        this.state.turnOrder[this.state.currentTurnIndex] !==
          client.sessionId ||
        typeof word !== 'string'
      ) {
        return;
      }
      const trimmed = word.trim().slice(0, MAX_CLUE_LENGTH);
      if (!trimmed) {
        return;
      }

      const player = this.state.players.get(client.sessionId);
      const clue = new Clue();
      clue.sessionId = client.sessionId;
      clue.name = player?.name ?? '';
      clue.word = trimmed;
      clue.round = this.state.round;
      clue.submittedAt = Date.now();
      this.state.clues.push(clue);
      this.advanceTurn();
    },

    castVote: (client: Client, targetSessionId: unknown) => {
      if (
        this.state.phase !== 'voting' ||
        typeof targetSessionId !== 'string' ||
        targetSessionId === client.sessionId ||
        !this.state.alive.includes(client.sessionId) ||
        !this.state.alive.includes(targetSessionId)
      ) {
        return;
      }

      const existingVote = this.state.votes.find(
        (vote) => vote.voterSessionId === client.sessionId,
      );
      if (existingVote) {
        existingVote.targetSessionId = targetSessionId;
      } else {
        const vote = new Vote();
        vote.voterSessionId = client.sessionId;
        vote.targetSessionId = targetSessionId;
        this.state.votes.push(vote);
      }

      if (this.state.votes.length >= this.state.alive.length) {
        this.resolveVoting();
      }
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

    if (ROUND_PHASES.includes(this.state.phase)) {
      this.removeFromRound(client.sessionId);
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

  private removeFromRound(sessionId: string) {
    const aliveIndex = this.state.alive.indexOf(sessionId);
    if (aliveIndex === -1) {
      return;
    }
    this.state.alive.splice(aliveIndex, 1);

    const winner = checkWinCondition([...this.state.alive], this.roles);
    if (winner) {
      this.endWithWinner(winner);
      return;
    }

    if (this.state.phase === 'voting') {
      for (let i = this.state.votes.length - 1; i >= 0; i--) {
        if (this.state.votes[i].voterSessionId === sessionId) {
          this.state.votes.splice(i, 1);
        }
      }
      if (this.state.votes.length >= this.state.alive.length) {
        this.resolveVoting();
      }
      return;
    }

    if (this.state.phase !== 'describing') {
      return;
    }
    const turnIndex = this.state.turnOrder.indexOf(sessionId);
    if (turnIndex === -1) {
      return;
    }
    this.state.turnOrder.splice(turnIndex, 1);
    if (turnIndex < this.state.currentTurnIndex) {
      this.state.currentTurnIndex -= 1;
    } else if (turnIndex === this.state.currentTurnIndex) {
      if (this.state.currentTurnIndex >= this.state.turnOrder.length) {
        this.startVoting();
      } else {
        this.startTurn();
      }
    }
  }

  private setPhase(phase: RoomPhase, durationMs = 0, onExpire?: () => void) {
    this.phaseTimer?.clear();
    this.phaseTimer = null;
    this.state.phase = phase;
    this.state.phaseEndsAt = durationMs ? Date.now() + durationMs : 0;
    if (durationMs && onExpire) {
      this.phaseTimer = this.clock.setTimeout(onExpire, durationMs);
    }
  }

  private beginRound() {
    this.state.turnOrder = new ArraySchema(
      ...buildTurnOrder([...this.state.alive]),
    );
    this.state.currentTurnIndex = 0;
    this.state.votes.clear();
    this.startTurn();
  }

  private startTurn() {
    this.setPhase('describing', TURN_DURATION_MS, () => this.advanceTurn());
  }

  private advanceTurn() {
    this.state.currentTurnIndex += 1;
    if (this.state.currentTurnIndex >= this.state.turnOrder.length) {
      this.startVoting();
    } else {
      this.startTurn();
    }
  }

  private startVoting() {
    this.state.votes.clear();
    this.setPhase('voting', VOTING_DURATION_MS, () => this.resolveVoting());
  }

  private resolveVoting() {
    const { eliminatedSessionId } = tallyVotes(
      [...this.state.votes],
      [...this.state.alive],
    );

    const record = new EliminationRecord();
    record.round = this.state.round;
    if (eliminatedSessionId) {
      const aliveIndex = this.state.alive.indexOf(eliminatedSessionId);
      if (aliveIndex !== -1) {
        this.state.alive.splice(aliveIndex, 1);
      }
      record.eliminatedSessionId = eliminatedSessionId;
      record.eliminatedName =
        this.state.players.get(eliminatedSessionId)?.name ?? '';
      record.eliminatedRole = this.roles.get(eliminatedSessionId) ?? '';
    }
    this.state.eliminationHistory.push(record);
    this.removeParticipant(eliminatedSessionId ?? '');

    const winner = checkWinCondition([...this.state.alive], this.roles);
    if (winner) {
      this.endWithWinner(winner);
      return;
    }
    this.setPhase('reveal', REVEAL_DURATION_MS, () =>
      this.advanceAfterReveal(),
    );
  }

  private advanceAfterReveal() {
    this.state.round += 1;
    this.beginRound();
  }

  private endWithWinner(winner: string) {
    this.logger.log(`game over, ${winner} win`);
    this.state.winner = winner;
    for (const sessionId of this.state.participants) {
      this.state.revealedRoles.set(sessionId, this.roles.get(sessionId) ?? '');
    }
    this.setPhase('finished', FINISHED_DURATION_MS, () => this.finishGame());
  }

  private finishGame() {
    this.setPhase('open');
    this.state.participants.clear();
    this.state.round = 0;
    this.state.alive.clear();
    this.state.turnOrder.clear();
    this.state.currentTurnIndex = 0;
    this.state.clues.clear();
    this.state.votes.clear();
    this.state.eliminationHistory.clear();
    this.state.winner = '';
    this.state.revealedRoles.clear();
    this.wordPair = null;
    this.roles.clear();
  }
}
