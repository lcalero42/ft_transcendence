import { useParams } from "react-router-dom";
import { useRoom } from "@colyseus/react";
import type { Rooms } from "@back/colyseus/rooms/Rooms";
import { client } from "@/lib/colyseusClient";
import GameView from "@/components/colyseus/GameView";

function GameRoom() {
	const { id } = useParams();

	const { room, error, isConnecting } = useRoom(
		id ? () => client.joinById<Rooms>(id) : null,
		[id],
	);

	if (!id) return <p>My_Error: no room id provided</p>;
	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>My_Error: {error.message}</p>;
	if (!room) return <p>My_Error: room unavailable</p>;

	return <GameView room={room} />;
}

export default GameRoom;
