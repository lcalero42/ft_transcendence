const BASE_URL = import.meta.env.VITE_API_URL;


export interface Room {
    id: number;
    name: string;
    min_player: number;
    max_player: number;
}


export async function countRoomActives() {
	const res = await fetch(`${BASE_URL}/room/count-activ`);
	if (!res.ok) throw new Error('failed to count rooms actives');
	return res.json();
}

export async function fetchRooms(): Promise<Room[]> {
  const res = await fetch(`${BASE_URL}/room/current`);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}

export async function createRoom(data: { name: string }): Promise<Room> {
  const res = await fetch(`${BASE_URL}/room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}

export async function deleteRoom(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/room/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete room');
}
