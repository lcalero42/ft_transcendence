import { Logger } from '@nestjs/common';
import { Room, type Client, matchMaker } from '@colyseus/core';
import { LobbyState, LobbyPlayer } from './LobbyState';

export interface JoinOptions {
  name?: string;
  avatarUrl?: string;
}

const GAME_ROOM_NAME = 'udvRoom';
const RECONNECTION_WINDOW_SECONDS = 20;

export class LobbyRoom extends Room {
  maxClients = 4;
  state = new LobbyState();

  private readonly logger = new Logger('LobbyRoom');

  messages = {
    start: async (client: Client) => {
      if (client.sessionId !== this.state.hostSessionId) {
        return;
      }

      const gameRoom = await matchMaker.createRoom(GAME_ROOM_NAME, {});

      for (const [sessionId, player] of this.state.players.entries()) {
        const reservation = await matchMaker.reserveSeatFor(gameRoom, {
          name: player.name,
          avatarUrl: player.avatarUrl,
        });
        this.clients.getById(sessionId)?.send('seatReservation', reservation);
      }
    },
  };

  // Called when the lobby is created
  onCreate() {
    this.logger.log('lobby created');
  }

  // Called when a client joins the lobby
  onJoin(client: Client, options?: JoinOptions) {
    this.logger.log('lobby joined');
    const player = new LobbyPlayer();
    player.name = options?.name?.trim() || 'Player';
    player.avatarUrl = options?.avatarUrl?.trim() || '';
    this.state.players.set(client.sessionId, player);

    if (!this.state.hostSessionId) {
      this.state.hostSessionId = client.sessionId;
    }
  }

  // Called when a client disconnects without leaving on purpose (e.g. page refresh, dropped connection)
  onDrop(client: Client) {
    this.logger.log('lobby connection dropped, awaiting reconnection');
    this.allowReconnection(client, RECONNECTION_WINDOW_SECONDS);
  }

  // Called when a dropped client successfully reconnects
  onReconnect() {
    this.logger.log('lobby reconnected');
  }

  // Called when a client permanently leaves the lobby (consented leave, or reconnection window expired)
  onLeave(client: Client) {
    this.logger.log('lobby left');
    this.state.players.delete(client.sessionId);

    if (this.state.hostSessionId === client.sessionId) {
      const [nextHost] = Array.from(this.state.players.keys());
      this.state.hostSessionId = nextHost ?? '';
    }
  }

  // Called when the lobby is disposed
  onDispose() {
    this.logger.log('lobby disposed');
  }
}
