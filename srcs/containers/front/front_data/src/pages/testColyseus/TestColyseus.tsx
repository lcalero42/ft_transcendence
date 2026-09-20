import { useRoom } from "@colyseus/react";
import GameView from "@/components/colyseus/GameView";
import { client } from "@/lib/colyseusClient";
import type { UndercoverRoom } from "@back/colyseus/rooms/UndercoverRoom"

export default function TestColyseus() {

	const { room, error, isConnecting } = useRoom(
		() => client.joinOrCreate<UndercoverRoom>("undercover", { name: `Tester-${Math.floor(Math.random() * 1000)}` }),
	);

	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>My_Error: {error.message}</p>;
	if (!room) return <p>My_Error: room unavailable</p>;

	return <GameView room={room} />;
}
