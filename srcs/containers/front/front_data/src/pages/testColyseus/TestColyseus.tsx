import { useRoom } from "@colyseus/react";
import GameView from "@/components/colyseus/GameView";
import { client } from "@/lib/colyseusClient";
import type { Rooms } from "@back/colyseus/rooms/Rooms"

export default function TestColyseus() {

	const { room, error, isConnecting } = useRoom(
		() => client.joinOrCreate<Rooms>("udvRoom"),
	);

	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>My_Error: {error.message}</p>;
	if (!room) return <p>My_Error: room unavailable</p>;

	return <GameView room={room} />;
}
