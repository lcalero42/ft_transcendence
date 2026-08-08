const BASE_URL = import.meta.env.VITE_API_URL;

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

	const res = await fetch(`${BASE_URL}/player/${playerId}/avatar`, {
		method: 'PATCH',
		body: formData,
	});
	if (!res.ok) throw new Error('Failed to update avatar');
	return res.json();
}
