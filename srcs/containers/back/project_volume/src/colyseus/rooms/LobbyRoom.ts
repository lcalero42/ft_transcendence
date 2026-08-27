import { Logger } from '@nestjs/common';
import { Room, type Client, matchMaker } from '@colyseus/core';
import { LobbyState, LobbyPlayer } from './LobbyState';

export interface JoinOptions {
  name?: string;
}

const GAME_ROOM_NAME = 'udvRoom';

export class LobbyRoom extends Room {
  maxClients = 4;
  autoDispose = false;
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
    this.state.players.set(client.sessionId, player);

    if (!this.state.hostSessionId) {
      this.state.hostSessionId = client.sessionId;
    }
  }

  // Called when a client leaves the lobby
  onLeave(client: Client) {
    this.logger.log('lobby left');
    this.state.players.delete(client.sessionId);
  }

  // Called when the lobby is disposed
  onDispose() {
    this.logger.log('lobby disposed');
  }
}
