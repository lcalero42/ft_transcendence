import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom, useRoomState } from "@colyseus/react";
import type { SeatReservation } from "@colyseus/sdk";
import type { LobbyRoom } from "@back/colyseus/rooms/LobbyRoom";
import { client } from "@/lib/colyseusClient";
import { useAuth } from "@/context/useAuth";

export default function CreateRoom() {
	const { user } = useAuth();
	const { roomId } = useParams();
	const navigate = useNavigate();

	const { room, error, isConnecting } = useRoom(
		roomId
			? () => client.joinById<LobbyRoom>(roomId, { name: user?.email })
			: () => client.create<LobbyRoom>("lobby", { name: user?.email }),
		[roomId],
	);

	const players = useRoomState(room, (s) => s.players);
	const hostSessionId = useRoomState(room, (s) => s.hostSessionId);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!room) return;
		return room.onMessage("seatReservation", (reservation: SeatReservation) => {
			navigate(`/game/${reservation.roomId}`, { state: { reservation } });
		});
	}, [room, navigate]);

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
			<button onClick={handleCopy}>{copied ? "Copié !" : "Copier le lien"}</button>

			<h2>Joueurs ({playerEntries.length})</h2>
			<ul>
				{playerEntries.map(([sessionId, player]) => (
					<li key={sessionId}>
						{player.name}
						{sessionId === room.sessionId ? " (toi)" : ""}
					</li>
				))}
			</ul>

			{isHost && <button onClick={handleStart}>Lancer la partie</button>}
		</div>
	);
}
