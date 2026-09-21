import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom, useRoomState } from "@colyseus/react";
import type { SeatReservation } from "@colyseus/sdk";
import type { UndercoverRoom } from "@back/colyseus/rooms/UndercoverRoom";
import { client } from "@/lib/colyseusClient";
import {
	clearReconnection,
	readStoredReconnection,
	storeReconnection,
} from "@/lib/roomReconnection";
import { useAuth } from "@/context/useAuth";
import DefaultAvatar from "@/assets/profile-photo/moon.png";

function resolveAvatar(avatarUrl: string) {
	return avatarUrl ? `${import.meta.env.VITE_API_URL}${avatarUrl}` : DefaultAvatar;
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
							return await client.reconnect<UndercoverRoom>(stored.token);
						} catch {
							clearReconnection();
						}
					}
					return targetRoomId
						? client.joinById<UndercoverRoom>(targetRoomId, { name: profile?.name, avatarUrl: profile?.avatarUrl })
						: client.create<UndercoverRoom>("undercover", { name: profile?.name, avatarUrl: profile?.avatarUrl });
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

	// The server issues a new reconnection token on every join, and the SDK's
	// automatic retry rewrites it on the same room object, so re-store it.
	useEffect(() => {
		if (!room) return;
		const onReconnect = () => storeReconnection(room);
		room.onReconnect(onReconnect);
		return () => room.onReconnect.remove(onReconnect);
	}, [room]);

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
							src={resolveAvatar(player.avatarUrl)}
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
