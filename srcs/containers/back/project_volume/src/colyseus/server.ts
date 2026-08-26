import { defineServer, defineRoom } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { createServer } from 'http';
import { Rooms } from './rooms/Rooms';

export const httpServer = createServer();

export const colyseusServer = defineServer({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
  rooms: {
    udvRoom: defineRoom(Rooms),
  },
});
