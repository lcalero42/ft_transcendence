import { Schema, MapSchema, type } from '@colyseus/schema';

export class LobbyPlayer extends Schema {
  @type('string') name: string = '';
  @type('string') avatarUrl: string = '';
}

export class LobbyState extends Schema {
  @type({ map: LobbyPlayer }) players = new MapSchema<LobbyPlayer>();
  @type('string') hostSessionId: string = '';
  @type('number') maxClients: number = 0;
}
