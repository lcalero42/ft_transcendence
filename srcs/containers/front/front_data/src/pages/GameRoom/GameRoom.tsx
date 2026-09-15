import { useParams, useLocation } from "react-router-dom";
import { useRoom } from "@colyseus/react";
import type { SeatReservation } from "@colyseus/sdk";
import type { UndercoverRoom } from "@back/colyseus/rooms/UndercoverRoom";
import type { UndercoverState } from "@back/colyseus/rooms/UndercoverState";
import { client } from "@/lib/colyseusClient";
import GameView from "@/components/colyseus/GameView";

function GameRoom() {
	const { id } = useParams();
	const location = useLocation();
	const reservation = (location.state as { reservation?: SeatReservation } | null)?.reservation;

	const { room, error, isConnecting } = useRoom<UndercoverRoom>(
		reservation
			? () => client.consumeSeatReservation<UndercoverState>(reservation)
			: id
				? () => client.joinById<UndercoverRoom>(id)
				: null,
		[id, reservation],
	);

	if (!id) return <p>My_Error: no room id provided</p>;
	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>My_Error: {error.message}</p>;
	if (!room) return <p>My_Error: room unavailable</p>;

	return <GameView room={room} />;
}

export default GameRoom;
