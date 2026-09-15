import type { Room } from "@colyseus/sdk";
import { useRoomState } from "@colyseus/react";
import type { Rooms } from "@back/colyseus/rooms/Rooms";
import { getAvatarUrl } from "@/api/player";
import GameHeader from "@/pages/GameRoom/components/GameHeader";
import Timer from "@/pages/GameRoom/components/Timer";
import PlayerAvatar from "@/pages/GameRoom/components/PlayerAvatar";

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
				<div className="flex flex-wrap gap-6">
					{playerEntries.map(([sessionId, player]) => (
						<PlayerAvatar key={sessionId} name={player.name} avatarUrl={getAvatarUrl(player.avatarUrl)} />
					))}
				</div>
			</main>
		</div>
	);
}

export default GameView;
