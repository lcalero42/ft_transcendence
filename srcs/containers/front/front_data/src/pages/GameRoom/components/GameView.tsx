import type { Room } from "@colyseus/sdk";
import { useRoomState } from "@colyseus/react";
import type { Rooms } from "@back/colyseus/rooms/Rooms";
import { getAvatarUrl } from "@/api/player";
import GameHeader from "@/pages/GameRoom/components/GameHeader";
import Timer from "@/pages/GameRoom/components/Timer";
import PlayerCircle from "@/pages/GameRoom/components/PlayerCircle";

interface GameViewProps {
	room: Room<Rooms>;
}

function GameView({ room }: GameViewProps) {
	const secondsLeft = 20;
	const players = useRoomState(room, (s) => s.players);
	const playerEntries = Object.entries(players ?? {});

	return (
		<div className="page">
			<GameHeader />
			<main className="page-main">
				<Timer secondsLeft={secondsLeft} />
				<PlayerCircle
					players={playerEntries.map(([sessionId, player]) => ({
						sessionId,
						name: player.name,
						avatarUrl: getAvatarUrl(player.avatarUrl),
					}))}
				/>
			</main>
		</div>
	);
}

export default GameView;
