import { defineServer, defineRoom } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { createServer } from 'http';
import { UndercoverRoom } from './rooms/UndercoverRoom';
import { PresenceRoom } from './rooms/PresenceRoom';

export const httpServer = createServer();

export const colyseusServer = defineServer({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
  rooms: {
    undercover: defineRoom(UndercoverRoom),
    presence: defineRoom(PresenceRoom),
  },
});
