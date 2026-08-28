import { apiFetch } from "./auth/client";
const BASE_URL = import.meta.env.VITE_API_URL;

export interface Player {
	id: number;
	name: string;
	email: string;
	aboutMe: string;
	avatarUrl: string;
	createdAt: string;
}
export interface GameListOfPlayer {
  id: number;
  name: string;
  nbPlayers: number;
  date: string;
  victory: boolean;
}

export async function getPlayers() {
	return apiFetch("/player");
}

export async function countPlayer() {
	return apiFetch("/player/count-activ");
}

export function getAvatarUrl(path: string | null): string | undefined {
	if (!path) return undefined;
	return `${BASE_URL}${path}`;
}

export async function updateAvatar(playerId: number, file: File): Promise<Player> {
	const formData = new FormData();
	formData.append('avatar', file);

	return apiFetch(`/player/${playerId}/avatar`, {
		method: 'PATCH',
		body: formData,
	});
}

export async function updateBio(playerId: number, aboutMe: string): Promise<Player> {
	return apiFetch(`/player/${playerId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ aboutMe }),
	});
}

export async function getMe() {
	return apiFetch("/player/me");
}

export async function getGamesList(playerId: number): Promise<GameListOfPlayer[]> {
  return apiFetch(`/player/${playerId}/games`);
}

export async function getCountGamesPlayed(playerId: number): Promise<number> {
	const res = await apiFetch(`/player/${playerId}/games-played`);
	return res.gamesPlayed;
}

export async function getCountVictory(playerId: number): Promise<number> {
	const res = await apiFetch(`/player/${playerId}/victory`);
	return res.victoriesCount;
}

export async function getWinRate(playerId: number): Promise<number> {
	const res = await apiFetch(`/player/${playerId}/winrate`);
	return res.winrate;
}
