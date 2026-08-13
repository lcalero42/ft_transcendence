import { Client } from "@colyseus/sdk";
import { useRoom } from "@colyseus/react";
import type { server } from "../../../../../back/project_volume/src/colyseus/server"

const client = new Client<typeof server>("ws://localhost:2567");

export default function TestColyseus() {

	const { room, error, isConnecting } = useRoom(
		() => client.joinOrCreate("my_rooms"),
	);
	console.log(room);

	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>Error: {error.message}</p>;

	return <div>Hello</div>
}
