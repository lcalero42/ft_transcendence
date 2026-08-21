import { apiFetch } from "./auth/client";

export interface Player {
	id: number;
	name: string;
	email: string;
	aboutMe: string;
	avatarUrl: string;
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

