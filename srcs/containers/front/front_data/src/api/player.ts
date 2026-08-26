import { apiFetch } from "./auth/client";

export interface Player {
	id: number;
	name: string;
	email: string;
	aboutMe: string;
	avatarUrl: string;
}

export async function getPlayers() {
	const res = await fetch(`${BASE_URL}/player`);
	if (!res.ok) throw new Error('Failed to fetch list players');
	return res.json();
}

export async function countPlayer() {
	const res = await fetch(`${BASE_URL}/player/count-activ`);
	if (!res.ok) throw new Error('Failed to fetch players count');
	return res.json();
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
