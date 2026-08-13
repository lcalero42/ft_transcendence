
const BASE_URL = import.meta.env.VITE_API_URL;

export interface Player {
	id: number;
	name: string;
	email: string;
	aboutMe: string;
	avatarUrl: string;
}
export async function countPlayer() {
	const res = await fetch(`${BASE_URL}/player/count-activ`);
	if (!res.ok) throw new Error('failed to fetch player count');
	return res.json();
}
export async function updateAvatar(playerId: number, file: File): Promise<Player> {
	const formData = new FormData();
	formData.append('avatar', file);

	const res = await fetch(`${BASE_URL}/player/${playerId}/avatar`, {
		method: 'PATCH',
		body: formData,
	});
	if (!res.ok) throw new Error('Failed to update avatar');
	return res.json();
}

export async function updateBio(playerId: number, aboutMe: string): Promise<Player> {
	const res = await fetch(`${BASE_URL}/player/${playerId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ aboutMe }),
	});
	if (!res.ok) {
		const errorBody = await res.json().catch(() => null);
		const message = Array.isArray(errorBody?.message)
			? errorBody.message.join(', ')
			: errorBody?.message ?? 'Failed to update bio';
		throw new Error(message);
	}
	return res.json();
}

