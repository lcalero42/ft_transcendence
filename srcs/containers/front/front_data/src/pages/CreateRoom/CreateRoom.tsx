import { useState } from "react";
import { useRoom } from "@colyseus/react";
import type { Rooms } from "@back/colyseus/rooms/Rooms"
import { client } from "@/lib/colyseusClient";
import GameView from "@/components/colyseus/GameView";

export default function CreateRoom() {
	const { room, error, isConnecting } = useRoom(
		() => client.create<Rooms>("udvRoom"),
	);
	const [copied, setCopied] = useState(false);

	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>My_Error: {error.message}</p>;
	if (!room) return <p>My_Error: room unavailable</p>;

	const inviteLink = `${window.location.origin}/game/${room.roomId}`;

	const handleCopy = async () => {
		await navigator.clipboard.writeText(inviteLink);
		setCopied(true);
	};

	return (
		<div className="page">
			<h1>Room créée</h1>
			<p>Partage ce lien pour inviter des joueurs :</p>
			<input readOnly value={inviteLink} onFocus={(e) => e.target.select()} />
			<button onClick={handleCopy}>{copied ? "Copié !" : "Copier le lien"}</button>
			<GameView room={room} />
		</div>
	);
}
