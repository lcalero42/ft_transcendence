import { defineServer, defineRoom } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { createServer } from 'http';
import { Rooms } from './rooms/Rooms';
import { LobbyRoom } from './rooms/LobbyRoom';

export const httpServer = createServer();

export const colyseusServer = defineServer({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
  rooms: {
    udvRoom: defineRoom(Rooms),
    lobby: defineRoom(LobbyRoom),
  },
});
