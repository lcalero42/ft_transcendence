import { apiFetch } from "./auth/client";

export interface Room {
    id: number;
    name: string;
    min_player: number;
    max_player: number;
}


export async function fetchRooms(): Promise<Room[]> {
  return apiFetch<Room[]>("/room/current");
}

export async function createRoom(data: { name: string }): Promise<Room> {
  return apiFetch<Room>("/room", {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteRoom(id: number): Promise<void> {
  return apiFetch<void>(`/room/${id}`, { method: 'DELETE' });
}
