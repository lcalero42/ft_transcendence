import { Logger } from '@nestjs/common';
import type { Role } from './undercoverGameLogic';
import { MAX_ROOM_NAME_LENGTH } from './undercoverConstants';
import {
  createRoom,
  closeRoom,
  createGame,
  eliminatePlayer,
  finishGame,
  abortGame,
  type WordPair,
  type GamePlayer,
} from '../api';

export class RoomPersistence {
  private readonly logger = new Logger('UndercoverRoom');
  private playerIds = new Map<string, number>();
  private dbRoomId: number | null = null;
  private dbGameId: number | null = null;

  trackPlayer(sessionId: string, playerId?: number) {
    if (playerId) {
      this.playerIds.set(sessionId, playerId);
    }
  }

  forgetPlayer(sessionId: string) {
    this.playerIds.delete(sessionId);
  }

  getPlayerId(sessionId: string) {
    return this.playerIds.get(sessionId);
  }

  async saveRoom(
    token: string | undefined,
    hostName: string,
    colyseusRoomId: string,
  ) {
    if (!token) {
      this.logger.warn('host has no token, room not saved');
      return false;
    }
    this.dbRoomId = await createRoom(
      token,
      hostName.slice(0, MAX_ROOM_NAME_LENGTH),
      colyseusRoomId,
    );
    return this.dbRoomId !== null;
  }

  async saveGame(pair: WordPair, roles: Map<string, Role>) {
    if (!this.dbRoomId) {
      this.logger.warn('room was never saved, game not saved');
      return false;
    }
    this.dbGameId = await createGame(
      this.dbRoomId,
      pair,
      this.toGamePlayers(roles),
    );
    return this.dbGameId !== null;
  }

  saveElimination(sessionId: string) {
    const playerId = this.playerIds.get(sessionId);
    if (this.dbGameId && playerId) {
      void eliminatePlayer(this.dbGameId, playerId);
    }
  }

  saveWinner(winner: 'civilians' | 'undercover') {
    if (!this.dbGameId) {
      return;
    }
    void finishGame(
      this.dbGameId,
      winner === 'undercover' ? 'undercover' : 'civilian',
    );
    this.dbGameId = null;
  }

  async close() {
    if (this.dbGameId) {
      await abortGame(this.dbGameId);
    }
    if (this.dbRoomId) {
      await closeRoom(this.dbRoomId);
    }
  }

  private toGamePlayers(roles: Map<string, Role>): GamePlayer[] {
    const players: GamePlayer[] = [];
    for (const [sessionId, role] of roles) {
      const playerId = this.playerIds.get(sessionId);
      if (playerId) {
        players.push({ playerId, role });
      }
    }
    return players;
  }
}
