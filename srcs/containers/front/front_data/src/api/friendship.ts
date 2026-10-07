import { apiFetch } from "./auth/client";

export type FriendshipStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";

export interface FriendshipPlayer {
	id: number;
	name: string;
	avatarUrl: string | null;
}

export interface Friendship {
	id: number;
	status: FriendshipStatus;
	requesterId: number;
	addresseeId: number;
	requester: FriendshipPlayer;
	addressee: FriendshipPlayer;
	createdAt: string;
	updatedAt: string;
}

export function otherPlayer(friendship: Friendship, myId: number | undefined): FriendshipPlayer {
	return friendship.requesterId === myId ? friendship.addressee : friendship.requester;
}

export async function getFriends(): Promise<Friendship[]> {
	return apiFetch<Friendship[]>("/friendship?status=ACCEPTED");
}

export async function getPendingRequests(): Promise<Friendship[]> {
	return apiFetch<Friendship[]>("/friendship?status=PENDING");
}

export async function sendFriendRequestByName(name: string): Promise<Friendship> {
	return apiFetch<Friendship>("/friendship", {
		method: "POST",
		body: JSON.stringify({ name }),
	});
}

export async function respondToRequest(
	id: number,
	status: "ACCEPTED" | "DECLINED",
): Promise<Friendship> {
	return apiFetch<Friendship>(`/friendship/${id}`, {
		method: "PATCH",
		body: JSON.stringify({ status }),
	});
}

export async function cancelRequest(id: number): Promise<void> {
	await apiFetch<null>(`/friendship/${id}`, { method: "DELETE" });
}

export async function removeFriend(id: number): Promise<void> {
	await apiFetch<null>(`/friendship/${id}`, { method: "DELETE" });
}
