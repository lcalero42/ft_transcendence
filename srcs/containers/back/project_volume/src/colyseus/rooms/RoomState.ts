import { Schema, MapSchema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') name: string = '';
  @type('string') avatarUrl: string = '';
  @type('boolean') isHost: boolean = false;
}

export class RoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
