import { Logger } from '@nestjs/common';
import { ArraySchema } from '@colyseus/schema';
import type { Delayed } from '@colyseus/core';
import {
  Clue,
  Vote,
  EliminationRecord,
  type RoomPhase,
} from './UndercoverState';
import {
  buildTurnOrder,
  tallyVotes,
  checkWinCondition,
  type Role,
} from './undercoverGameLogic';
import {
  MAX_CLUE_LENGTH,
  STARTING_DURATION_MS,
  TURN_DURATION_MS,
  VOTING_DURATION_MS,
  REVEAL_DURATION_MS,
  FINISHED_DURATION_MS,
  ROUND_PHASES,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  type Language,
} from './undercoverConstants';
import { removeParticipant } from './undercoverLobby';
import type { RoomPersistence } from './RoomPersistence';
import type { UndercoverRoom } from './UndercoverRoom';
import type { WordPair } from '../api';

export class UndercoverGame {
  private readonly logger = new Logger('UndercoverRoom');
  private wordPair: WordPair | null = null;
  private roles = new Map<string, Role>();
  private languages = new Map<string, Language>();
  private phaseTimer: Delayed | null = null;
  private readonly room: UndercoverRoom;
  private readonly persistence: RoomPersistence;

  constructor(room: UndercoverRoom, persistence: RoomPersistence) {
    this.room = room;
    this.persistence = persistence;
  }

  private get state() {
    return this.room.state;
  }

  isRunning() {
    return ROUND_PHASES.includes(this.state.phase);
  }

  start(pair: WordPair, roles: Map<string, Role>) {
    this.wordPair = pair;
    this.roles = roles;
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
  }

  sendWord(sessionId: string) {
    const role = this.roles.get(sessionId);
    if (!role || !this.wordPair) {
      return;
    }
    const word =
      role === 'undercover'
        ? this.wordPair.undercoverWord
        : this.wordPair.civilianWord;
    this.room.clients.getById(sessionId)?.send('word', { word });
  }

  submitClue(sessionId: string, word: unknown) {
    if (
      this.state.phase !== 'describing' ||
      this.state.turnOrder[this.state.currentTurnIndex] !== sessionId ||
      typeof word !== 'string'
    ) {
      return;
    }
    const trimmed = word.trim().slice(0, MAX_CLUE_LENGTH);
    if (!trimmed) {
      return;
    }

    const player = this.state.players.get(sessionId);
    const clue = new Clue();
    clue.sessionId = sessionId;
    clue.name = player?.name ?? '';
    clue.word = trimmed;
    clue.round = this.state.round;
    clue.submittedAt = Date.now();
    this.state.clues.push(clue);
    this.advanceTurn();
  }

  castVote(sessionId: string, targetSessionId: unknown) {
    if (
      this.state.phase !== 'voting' ||
      typeof targetSessionId !== 'string' ||
      targetSessionId === sessionId ||
      !this.state.alive.includes(sessionId) ||
      !this.state.alive.includes(targetSessionId)
    ) {
      return;
    }

    const existingVote = this.state.votes.find(
      (vote) => vote.voterSessionId === sessionId,
    );
    if (existingVote) {
      existingVote.targetSessionId = targetSessionId;
    } else {
      const vote = new Vote();
      vote.voterSessionId = sessionId;
      vote.targetSessionId = targetSessionId;
      this.state.votes.push(vote);
    }

    if (this.state.votes.length >= this.state.alive.length) {
      this.resolveVoting();
    }
  }

  removePlayer(sessionId: string) {
    const aliveIndex = this.state.alive.indexOf(sessionId);
    if (aliveIndex === -1) {
      return;
    }
    this.state.alive.splice(aliveIndex, 1);
    this.persistence.saveElimination(sessionId);

    const winner = checkWinCondition([...this.state.alive], this.roles);
    if (winner) {
      this.endWithWinner(winner);
      return;
    }

    if (this.state.phase === 'voting') {
      this.removeVotesFrom(sessionId);
      return;
    }
    if (this.state.phase === 'describing') {
      this.removeFromTurnOrder(sessionId);
    }
  }

  private removeVotesFrom(sessionId: string) {
    for (let i = this.state.votes.length - 1; i >= 0; i--) {
      if (this.state.votes[i].voterSessionId === sessionId) {
        this.state.votes.splice(i, 1);
      }
    }
    if (this.state.votes.length >= this.state.alive.length) {
      this.resolveVoting();
    }
  }

  private removeFromTurnOrder(sessionId: string) {
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
      this.phaseTimer = this.room.clock.setTimeout(onExpire, durationMs);
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
        this.persistence.saveElimination(eliminatedSessionId);
      }
      record.eliminatedSessionId = eliminatedSessionId;
      record.eliminatedName =
        this.state.players.get(eliminatedSessionId)?.name ?? '';
      record.eliminatedRole = this.roles.get(eliminatedSessionId) ?? '';
    }
    this.state.eliminationHistory.push(record);
    removeParticipant(this.state, eliminatedSessionId ?? '');

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

  private endWithWinner(winner: 'civilians' | 'undercover') {
    this.logger.log(`game over, ${winner} win`);
    this.persistence.saveWinner(winner);
    this.state.winner = winner;
    for (const sessionId of this.state.participants) {
      this.state.revealedRoles.set(sessionId, this.roles.get(sessionId) ?? '');
    }
    this.setPhase('finished', FINISHED_DURATION_MS, () => this.reset());
  }

  private reset() {
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
