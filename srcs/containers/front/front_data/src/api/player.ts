import { apiFetch } from "./auth/client";
import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";
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

export interface PlayerSummary {
	id: number;
	name: string;
	createdAt: string;
	avatarUrl: string | null;
	isLog: boolean;
}

interface GamesPlayedResponse {
  gamesPlayed: number;
}

interface VictoryResponse {
  victoriesCount: number;
}

interface WinRateResponse {
  winrate: number;
}


export async function getPlayers() {
	return apiFetch<PlayerSummary[]>("/player");
}

export async function countPlayer() {
	return apiFetch<number>("/player/count-activ");
}

export function getAvatarUrl(path: string | null): string {
	return path ? `${BASE_URL}${path}` : AvatarDefault;
}

export async function updateAvatar(playerId: number, file: File): Promise<Player> {
	const formData = new FormData();
	formData.append('avatar', file);

	return apiFetch<Player>(`/player/${playerId}/avatar`, {
		method: 'PATCH',
		body: formData,
	});
}

export async function updateBio(playerId: number, aboutMe: string): Promise<Player> {
	return apiFetch<Player>(`/player/${playerId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ aboutMe }),
	});
}

export async function getMe(): Promise<Player> {
	return apiFetch<Player>("/player/me");
}

export async function getGamesList(playerId: number): Promise<GameListOfPlayer[]> {
  return apiFetch(`/player/${playerId}/games`);
}

export async function getCountGamesPlayed(playerId: number): Promise<number> {
	const res = await apiFetch<GamesPlayedResponse>(`/player/${playerId}/games-played`);
	return res.gamesPlayed;
}

export async function getCountVictory(playerId: number): Promise<number> {
	const res = await apiFetch<VictoryResponse>(`/player/${playerId}/victory`);
	return res.victoriesCount;
}

export async function getWinRate(playerId: number): Promise<number> {
	const res = await apiFetch<WinRateResponse>(`/player/${playerId}/winrate`);
	return res.winrate;
}
