import { Logger } from '@nestjs/common';
import { requireEnv } from '../common/require-env';
import type { Role } from './rooms/undercoverGameLogic';

const API_URL = `http://localhost:${process.env.PORT ?? 3000}`;
const logger = new Logger('ColyseusApi');

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

export interface WordPair {
  civilianWord: string;
  undercoverWord: string;
  civilianWordFr: string;
  undercoverWordFr: string;
  civilianWordEs: string;
  undercoverWordEs: string;
}

export interface GamePlayer {
  playerId: number;
  role: Role;
}

async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T | null> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-api-key': requireEnv('INTERNAL_API_KEY'),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      logger.warn(`${method} ${path} failed: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    logger.warn(`${method} ${path} failed: ${String(error)}`);
    return null;
  }
}

export async function getPlayerId(token: string) {
  const player = await getPlayer(token);
  return player?.id ?? null;
}

export function getPlayer(token: string) {
  return apiRequest<{ id: number; isAdmin: boolean; isGuest: boolean }>(
    '/player/me',
    { token },
  );
}

export async function getFriendIds(token: string, playerId: number) {
  const friendships = await apiRequest<
    { requesterId: number; addresseeId: number }[]
  >('/friendship?status=ACCEPTED', { token });
  return (
    friendships?.map((f) =>
      f.requesterId === playerId ? f.addresseeId : f.requesterId,
    ) ?? null
  );
}

export async function areFriends(token: string, friendId: number) {
  const friendships = await apiRequest<
    { requesterId: number; addresseeId: number }[]
  >('/friendship?status=ACCEPTED', { token });
  return (
    friendships?.some(
      (f) => f.requesterId === friendId || f.addresseeId === friendId,
    ) ?? false
  );
}

export async function createRoom(
  token: string,
  name: string,
  colyseusRoomId: string,
) {
  const room = await apiRequest<{ id: number }>('/room', {
    method: 'POST',
    token,
    body: { name, colyseusRoomId },
  });
  return room?.id ?? null;
}

export function closeRoom(roomId: number) {
  return apiRequest(`/room/internal/${roomId}`, { method: 'DELETE' });
}

export async function fetchWordPair(): Promise<WordPair | null> {
  const pairs = await apiRequest<WordPair[]>('/word-pair/internal');
  if (!pairs || pairs.length === 0) {
    return null;
  }
  return pairs[Math.floor(Math.random() * pairs.length)];
}

export async function createGame(
  roomId: number,
  { civilianWord, undercoverWord }: WordPair,
  players: GamePlayer[],
) {
  const game = await apiRequest<{ id: number }>('/game/internal', {
    method: 'POST',
    body: { roomId, civilianWord, undercoverWord, players },
  });
  return game?.id ?? null;
}

export function eliminatePlayer(gameId: number, playerId: number) {
  return apiRequest(`/game/internal/${gameId}/eliminate`, {
    method: 'PATCH',
    body: { playerId },
  });
}

export function finishGame(gameId: number, victory: Role) {
  return apiRequest(`/game/internal/${gameId}/finish`, {
    method: 'PATCH',
    body: { victory },
  });
}

export function abortGame(gameId: number) {
  return apiRequest(`/game/internal/${gameId}`, { method: 'DELETE' });
}
