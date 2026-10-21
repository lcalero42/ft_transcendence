import type { PresenceRoom } from './rooms/PresenceRoom';

let activeRoom: PresenceRoom | null = null;

export function registerPresenceRoom(room: PresenceRoom) {
  activeRoom = room;
}

export function unregisterPresenceRoom(room: PresenceRoom) {
  if (activeRoom === room) activeRoom = null;
}

export function notifyPlayer(
  playerId: number,
  type: string,
  payload: unknown,
): boolean {
  return activeRoom?.notifyPlayer(playerId, type, payload) ?? false;
}

export function updateFriendship(
  playerId: number,
  otherId: number,
  friends: boolean,
) {
  activeRoom?.updateFriendship(playerId, otherId, friends);
}

export function notifyAll(type: string, payload?: unknown) {
  activeRoom?.broadcast(type, payload);
}
