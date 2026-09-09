import { useEffect, useRef } from "react";
import type { Room } from "@colyseus/sdk";
import type { Rooms } from "@back/colyseus/rooms/Rooms";
import Logo from "../../components/Logo/Logo";
import LinkProfile from "../../components/LinkProfile/LinkProfile";
import { useAuth } from "@/context/useAuth";

type GameViewProps = {
	room: Room<Rooms>;
};

type Payload = {
	x: number;
	y: number;
	name: string;
}

function GameView({ room }: GameViewProps) {
	const { profile } = useAuth();

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
		const payload: Payload = {
			x: 1,
			y: 2,
			name: "coucou"
		}
		room.send("do", payload);
	}, [room]);

	return (
		<div className="page">
			<header className="page-header">
				<Logo />
				<LinkProfile
				name={profile?.name ? profile.name : "login"} icon="🥷" />
			</header>
		</div>
	);
}

export default GameView;