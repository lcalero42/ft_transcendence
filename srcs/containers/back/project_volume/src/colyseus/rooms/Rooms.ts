import { Logger } from '@nestjs/common';
import { Room, type Client } from '@colyseus/core';
import { RoomState, Player } from './RoomState';

export interface Payload {
  x: number;
  y: number;
  name: string;
}

export interface JoinOptions {
  name?: string;
  avatarUrl?: string;
  isHost?: boolean;
}

export class Rooms extends Room {
  maxClients = 4;
  autoDispose = false;
  state = new RoomState();

  private readonly logger = new Logger('Rooms');

  messages = {
    doSomething: (client: Client, payload: Payload) => {
      // handle client's "doSomething" message
      this.logger.log(`client: ${client.sessionId}`);
      this.logger.log(`payload: ${JSON.stringify(payload)}`);
    },
    do: (client: Client, payload: Payload) => {
      this.logger.log(
        `${client.sessionId} sent 'action' message: ${JSON.stringify(payload)}`,
      );
    },
  };

  // Called when the room is created
  onCreate() {
    this.logger.log('room created');
  }

  // Called when a client joins the room
  onJoin(client: Client, options?: JoinOptions) {
    this.logger.log('room joined');
    const player = new Player();
    player.name = options?.name?.trim() || 'Player';
    player.avatarUrl = options?.avatarUrl?.trim() || '';
    player.isHost = options?.isHost === true;
    this.state.players.set(client.sessionId, player);
    client.send('welcome', 'Welcome to the room!');
  }

  // Called when a client leaves the room
  onLeave(client: Client) {
    this.logger.log('room leaved');
    this.state.players.delete(client.sessionId);
  }

  // Called when the room is disposed
  onDispose() {
    this.logger.log('room disposed');
    this.logger.log('------------------------------');
  }
}
