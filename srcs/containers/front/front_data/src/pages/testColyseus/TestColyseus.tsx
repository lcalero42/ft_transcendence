import { Client } from "@colyseus/sdk";
import { useRoom } from "@colyseus/react";
import GameView from "./components/GameView";
import type { colyseusServer } from "../../../../../back/project_volume/src/colyseus/server"
import type { Rooms } from "../../../../../back/project_volume/src/colyseus/rooms/Rooms"

const client = new Client<typeof colyseusServer>("ws://localhost:2567");

export default function TestColyseus() {

	const { room, error, isConnecting } = useRoom(
		() => client.joinOrCreate<Rooms>("udvRoom"),
	);

	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>My_Error: {error.message}</p>;

	return <GameView room={room} />;
}
