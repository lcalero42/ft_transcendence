const BASE_URL = import.meta.env.VITE_API_URL;

export interface Game {
    id: number;
	civilianWord: string;
	undercoverWord: string;

}

export async function getGames() {
	const res = await fetch(`${BASE_URL}/game`);
	if (!res.ok) throw new Error('Failed to fetch games');
	return res.json();
}

export async function countGames() {
	const res = await fetch(`${BASE_URL}/game/count`);
	if (!res.ok) throw new Error('Failed to count games');
	return res.json();
}
