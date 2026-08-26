import { apiFetch } from "./auth/client";

export interface Room {
    id: number;
    name: string;
    min_player: number;
    max_player: number;
	createdAt: string;
}


export async function countRoomActives() {
	return apiFetch("/room/count-activ");
}

export async function fetchRooms(): Promise<Room[]> {
  return apiFetch("/room/current");
}

export async function createRoom(data: { name: string }): Promise<Room> {
  return apiFetch("/room", {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteRoom(id: number): Promise<void> {
  return apiFetch(`/room/${id}`, { method: 'DELETE' });
}

export async function getGamesByRoom(id: number) {
  return apiFetch(`/room/${id}/games`);
}
