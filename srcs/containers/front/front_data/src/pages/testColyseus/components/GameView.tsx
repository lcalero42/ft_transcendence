import { useRoomState } from "@colyseus/react";
import { useEffect, useRef } from "react";
import type { Room } from "@colyseus/sdk";
import type { Rooms } from "../../../../../../back/project_volume/src/colyseus/rooms/Rooms";

type GameViewProps = {
	room: Room<Rooms>;
};

interface Payload {
	x: number;
	y: number;
	name: string;
}

function GameView({ room }: GameViewProps) {

	const payload: Payload = {
		x: 1,
		y: 2,
		name: "coucou"
	}

	useEffect(() => {
		if (!room) return;

		return room.onMessage("welcome", (message) => {
			console.log("message received from server");
			console.log(message);
		});
	}, [room]);

	const hasSentRef = useRef(false);
	useEffect(() => {
		if (hasSentRef.current) return;
		hasSentRef.current = true;
		room.send("do", payload);
	}, [room]);

	// const state = useRoomState(room);
	// if (!state?.players) return <p>Waiting for state...</p>;

	// return <p>Players: {Object.keys(state.players).length}</p>;
	return <p>okok</p>
}

export default GameView;