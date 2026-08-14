import { useEffect } from "react";
import { Client } from "@colyseus/sdk";
import { useRoom } from "@colyseus/react";
import GameView from "./components/GameView";
import type { colyseusServer } from "../../../../../back/project_volume/src/colyseus/server"
import type { Rooms } from "../../../../../back/project_volume/src/colyseus/rooms/Rooms"

const client = new Client<typeof colyseusServer>("ws://localhost:2567");

export default function TestColyseus() {

	const { room, error, isConnecting } = useRoom(
		() => client.joinOrCreate<Rooms>("udv_room"),
	);

	useEffect(() => {
		if (!room) return;

		return room.onMessage("welcome", (message) => {
			console.log("message received from server");
			console.log(message);
		});
	}, [room]);

	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>Error: {error.message}</p>;

	return <GameView room={room} />;
}
