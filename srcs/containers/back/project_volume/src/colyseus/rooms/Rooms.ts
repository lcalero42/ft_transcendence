import { Logger } from '@nestjs/common';
import { Room, Client } from '@colyseus/core';
import { RoomState } from './RoomState';

export interface Payload {
  x: number;
  y: number;
  name: string;
}

export class Rooms extends Room {
  maxClients = 4;
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
  onJoin(client: Client) {
    this.logger.log('room joined');
    // this.state.players.set(client.sessionId, new Player());
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
