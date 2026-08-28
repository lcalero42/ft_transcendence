import { apiFetch } from "./auth/client";

export interface Game {
    id: number;
	civilianWord: string;
	undercoverWord: string;

}

export async function getGames() {
	return apiFetch("/game");
}

export async function countGames() {
	return apiFetch("/game/count");
}

export async function getPlayersByGame(id: number) {
	return apiFetch(`/game/${id}/players`);
}
