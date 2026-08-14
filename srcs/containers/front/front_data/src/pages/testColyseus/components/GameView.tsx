// import { useRoomState } from "@colyseus/react";
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

	const hasSentRef = useRef(false);

	useEffect(() => {
		if (hasSentRef.current) return;
		hasSentRef.current = true;
		room.send("do", payload);
	}, [room]);

	return <p>GameView</p>

	// const state = useRoomState(room);
	// return <p>Players: {state.players.size}</p>;
}

export default GameView;