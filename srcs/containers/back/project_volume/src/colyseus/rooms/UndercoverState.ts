import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';

export type RoomPhase =
  | 'setup'
  | 'open'
  | 'describing'
  | 'voting'
  | 'reveal'
  | 'finished';

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

export class Clue extends Schema {
  @type('string') sessionId: string = '';
  @type('string') name: string = '';
  @type('string') word: string = '';
  @type('number') submittedAt: number = 0;
}

export class UndercoverState extends Schema {
  @type('string') phase: RoomPhase = 'setup';
  @type('string') hostSessionId: string = '';
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(['string']) participants = new ArraySchema<string>();
  @type('number') minParticipants: number = 0;
  @type('number') maxParticipants: number = 0;
  @type([ChatMessage]) chat = new ArraySchema<ChatMessage>();

  @type('number') round: number = 0;
  @type(['string']) alive = new ArraySchema<string>();
  @type(['string']) turnOrder = new ArraySchema<string>();
  @type('number') currentTurnIndex: number = 0;
  @type([Clue]) clues = new ArraySchema<Clue>();
}
