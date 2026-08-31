import { apiFetch } from "./auth/client";

export interface Game {
    id: number;
	civilianWord: string;
	undercoverWord: string;

}

export interface GamePlayer {
	id: number;
	name: string;
	avatarUrl: string | null;
	role: string;
}

export async function getGames() {
	return apiFetch<Game[]>("/game");
}

export async function countGames() {
	return apiFetch<number>("/game/count");
}

export async function getPlayersByGame(id: number) {
	return apiFetch<GamePlayer[]>(`/game/${id}/players`);
}
