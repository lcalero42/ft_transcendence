import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';

export type RoomPhase =
  | 'setup'
  | 'open'
  | 'starting'
  | 'describing'
  | 'voting'
  | 'reveal'
  | 'finished';

export class Player extends Schema {
  @type('string') name: string = '';
  @type('string') avatarUrl: string = '';
  @type('number') playerId: number = 0;
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
  @type('number') round: number = 0;
  @type('number') submittedAt: number = 0;
}

export class Vote extends Schema {
  @type('string') voterSessionId: string = '';
  @type('string') targetSessionId: string = '';
}

export class EliminationRecord extends Schema {
  @type('number') round: number = 0;
  @type('string') eliminatedSessionId: string = '';
  @type('string') eliminatedName: string = '';
  @type('string') eliminatedRole: string = '';
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
  @type([Vote]) votes = new ArraySchema<Vote>();
  @type([EliminationRecord]) eliminationHistory =
    new ArraySchema<EliminationRecord>();
  @type('number') phaseEndsAt: number = 0;
  @type('string') winner: string = '';
  @type({ map: 'string' }) revealedRoles = new MapSchema<string>();
}
