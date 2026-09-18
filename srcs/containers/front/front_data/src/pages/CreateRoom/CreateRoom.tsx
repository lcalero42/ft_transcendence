import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom, useRoomState } from "@colyseus/react";
import type { Room, SeatReservation } from "@colyseus/sdk";
import type { LobbyRoom } from "@back/colyseus/rooms/LobbyRoom";
import { client } from "@/lib/colyseusClient";
import { useAuth } from "@/context/useAuth";
import { getAvatarUrl } from "@/api/player";

const RECONNECTION_STORAGE_KEY = "lobby-reconnection";

function readStoredReconnection(): { roomId: string; token: string } | null {
	try {
		const raw = sessionStorage.getItem(RECONNECTION_STORAGE_KEY);
		return raw ? (JSON.parse(raw) as { roomId: string; token: string }) : null;
	} catch {
		return null;
	}
}

function storeReconnection(room: Room) {
	try {
		sessionStorage.setItem(
			RECONNECTION_STORAGE_KEY,
			JSON.stringify({ roomId: room.roomId, token: room.reconnectionToken }),
		);
	} catch (err) {
		console.warn("storeReconnection failed", err);
	}
}

function clearReconnection() {
	try {
		sessionStorage.removeItem(RECONNECTION_STORAGE_KEY);
	} catch (err) {
		console.warn("clearReconnection failed", err);
	}
}

export default function CreateRoom() {
	const { profile, profileLoading } = useAuth();
	const { roomId: routeRoomId } = useParams();
	const navigate = useNavigate();

	// Frozen at mount so that our own `navigate()` call below (which updates
	// the URL to include the created room's id) doesn't retrigger useRoom.
	const targetRoomIdRef = useRef(routeRoomId);

	const { room, error, isConnecting } = useRoom(
		profileLoading
			? null
			: async () => {
					const targetRoomId = targetRoomIdRef.current;
					const stored = readStoredReconnection();
					if (stored && (!targetRoomId || stored.roomId === targetRoomId)) {
						try {
							return await client.reconnect<LobbyRoom>(stored.token);
						} catch {
							clearReconnection();
						}
					}
					return targetRoomId
						? client.joinById<LobbyRoom>(targetRoomId, { name: profile?.name, avatarUrl: profile?.avatarUrl })
						: client.create<LobbyRoom>("lobby", { name: profile?.name, avatarUrl: profile?.avatarUrl });
				},
		[profileLoading],
	);

	const players = useRoomState(room, (s) => s.players);
	const hostSessionId = useRoomState(room, (s) => s.hostSessionId);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!room) return;
		storeReconnection(room);
		if (routeRoomId !== room.roomId) {
			void navigate(`/create-room/${room.roomId}`, { replace: true });
		}
	}, [room, routeRoomId, navigate]);

	useEffect(() => {
		if (!room) return;
		return room.onMessage("seatReservation", (reservation: SeatReservation) => {
			clearReconnection();
			void navigate(`/game/${reservation.roomId}`, { state: { reservation } });
		});
	}, [room, navigate]);

	if (profileLoading) return <p>Connecting...</p>;
	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>My_Error: {error.message}</p>;
	if (!room) return <p>My_Error: room unavailable</p>;

	const inviteLink = `${window.location.origin}/create-room/${room.roomId}`;
	const playerEntries = Object.entries(players ?? {});
	const isHost = room.sessionId === hostSessionId;

	const handleCopy = async () => {
		await navigator.clipboard.writeText(inviteLink);
		setCopied(true);
	};

	const handleStart = () => {
		room.send("start");
	};

	return (
		<div className="page">
			<h1>Room créée</h1>
			<p>Partage ce lien pour inviter des joueurs :</p>
			<input readOnly value={inviteLink} onFocus={(e) => e.target.select()} />
			<button onClick={() => void handleCopy()}>{copied ? "Copié !" : "Copier le lien"}</button>

			<h2>Joueurs ({playerEntries.length})</h2>
			<ul>
				{playerEntries.map(([sessionId, player]) => (
					<li key={sessionId} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
						<img
							src={getAvatarUrl(player.avatarUrl)}
							alt={player.name}
							style={{ width: "2rem", height: "2rem", borderRadius: "9999px", objectFit: "cover" }}
						/>
						{player.name}
						{sessionId === room.sessionId ? " (toi)" : ""}
					</li>
				))}
			</ul>

			{isHost && <button onClick={handleStart}>Lancer la partie</button>}
		</div>
	);
}
