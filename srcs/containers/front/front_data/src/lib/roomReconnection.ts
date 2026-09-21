import type { Room } from "@colyseus/sdk";

// One key for the whole lobby -> game flow: it is the same Colyseus room throughout.
const RECONNECTION_STORAGE_KEY = "room-reconnection";

export type StoredReconnection = { roomId: string; token: string };

export function readStoredReconnection(): StoredReconnection | null {
	try {
		const raw = sessionStorage.getItem(RECONNECTION_STORAGE_KEY);
		return raw ? (JSON.parse(raw) as StoredReconnection) : null;
	} catch {
		return null;
	}
}

export function storeReconnection(room: Room) {
	try {
		sessionStorage.setItem(
			RECONNECTION_STORAGE_KEY,
			JSON.stringify({ roomId: room.roomId, token: room.reconnectionToken }),
		);
	} catch {
		// ignore storage failures (e.g. private browsing)
	}
}

export function clearReconnection() {
	try {
		sessionStorage.removeItem(RECONNECTION_STORAGE_KEY);
	} catch {
		// ignore storage failures
	}
}
