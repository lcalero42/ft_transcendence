const BASE_URL = import.meta.env.VITE_API_URL;

export interface Game {
    id: number;
	civilianWord: string;
	undercoverWord: string;

}

export async function countGames() {
	const res = await fetch(`${BASE_URL}/game/count`);
	if (!res.ok) throw new Error('failed to count games');
	return res.json();
}
