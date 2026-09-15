import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';

// setup   -> host is inviting friends, room is private (invite link only)
// open    -> room is listed, players chat and register for the next game
// playing -> a game is running between the participants, others spectate
export type RoomPhase = 'setup' | 'open' | 'playing';

export class Player extends Schema {
  @type('string') name: string = '';
  @type('string') avatarUrl: string = '';
  @type('boolean') connected: boolean = true;
}

export class ChatMessage extends Schema {
  @type('string') sessionId: string = '';
  @type('string') name: string = '';
  @type('string') text: string = '';
  @type('number') sentAt: number = 0;
}

export class UndercoverState extends Schema {
  @type('string') phase: RoomPhase = 'setup';
  @type('string') hostSessionId: string = '';
  @type({ map: Player }) players = new MapSchema<Player>();
  // sessionIds of the players registered for the next (or current) game
  @type(['string']) participants = new ArraySchema<string>();
  @type('number') minParticipants: number = 0;
  @type('number') maxParticipants: number = 0;
  @type([ChatMessage]) chat = new ArraySchema<ChatMessage>();
}
