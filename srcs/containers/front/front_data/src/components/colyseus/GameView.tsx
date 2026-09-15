import { useEffect } from "react";
import type { Room } from "@colyseus/sdk";
import type { UndercoverRoom } from "@back/colyseus/rooms/UndercoverRoom";

type GameViewProps = {
	room: Room<UndercoverRoom>;
};

function GameView({ room }: GameViewProps) {

	useEffect(() => {
		if (!room) return;

		return room.onMessage("welcome", (message) => {
			console.log("message received from server");
			console.log(message);
		});
	}, [room]);

	return <p>okok</p>
}

export default GameView;