import { ChatMessage, type UndercoverState } from './UndercoverState';
import {
  MAX_CHAT_HISTORY,
  MAX_CHAT_MESSAGE_LENGTH,
} from './undercoverConstants';

export function addParticipant(state: UndercoverState, sessionId: string) {
  const { participants } = state;
  if (
    state.phase !== 'open' ||
    participants.includes(sessionId) ||
    participants.length >= state.maxParticipants
  ) {
    return;
  }
  participants.push(sessionId);
}

export function removeParticipant(state: UndercoverState, sessionId: string) {
  const index = state.participants.indexOf(sessionId);
  if (index !== -1) {
    state.participants.splice(index, 1);
  }
}

export function addChatMessage(
  state: UndercoverState,
  sessionId: string,
  text: unknown,
) {
  const player = state.players.get(sessionId);
  if (!player || typeof text !== 'string') {
    return;
  }
  const trimmed = text.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH);
  if (!trimmed) {
    return;
  }

  const message = new ChatMessage();
  message.sessionId = sessionId;
  message.name = player.name;
  message.text = trimmed;
  message.sentAt = Date.now();
  state.chat.push(message);

  if (state.chat.length > MAX_CHAT_HISTORY) {
    state.chat.shift();
  }
}
