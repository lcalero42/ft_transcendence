import type { RoomPhase } from './UndercoverState';

export const MIN_PARTICIPANTS = 3;
export const MAX_PARTICIPANTS = 6;
export const MAX_CLIENTS = 12;
export const MAX_CHAT_HISTORY = 100;
export const MAX_CHAT_MESSAGE_LENGTH = 300;
export const MAX_CLUE_LENGTH = 60;
export const STARTING_DURATION_MS = 5000;
export const TURN_DURATION_MS = 60000;
export const VOTING_DURATION_MS = 30000;
export const REVEAL_DURATION_MS = 5000;
export const FINISHED_DURATION_MS = 5000;
export const RECONNECTION_WINDOW_SECONDS = 20;
export const EMPTY_ROOM_GRACE_SECONDS = 5;
export const TAKEN_OVER_CODE = 4100;
export const MAX_ROOM_NAME_LENGTH = 32;
export const LANGUAGES = ['en', 'fr', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';
export const ROUND_PHASES: RoomPhase[] = [
  'starting',
  'describing',
  'voting',
  'reveal',
];
