import type { Room } from "@colyseus/sdk";
import { useRoomState } from "@colyseus/react";
import type { Rooms } from "@back/colyseus/rooms/Rooms";
import { getAvatarUrl } from "@/api/player";
import GameHeader from "@/pages/GameRoom/components/GameHeader";
import Timer from "@/pages/GameRoom/components/Timer";
import PlayerCircle, { getPlayerAngleDeg } from "@/pages/GameRoom/components/PlayerCircle";
import CenterWord from "@/pages/GameRoom/components/CenterWord";
import TurnInput from "@/pages/GameRoom/components/TurnInput";

interface GameViewProps {
	room: Room<Rooms>;
}

function GameView({ room }: GameViewProps) {
	const secondsLeft = 20;
	const currentWord = "PLUME";
	const activePlayerIndex = 0;
	const players = useRoomState(room, (s) => s.players);
	const playerEntries = Object.entries(players ?? {});
	const arrowDirection = getPlayerAngleDeg(activePlayerIndex, playerEntries.length);
	const activePlayer = playerEntries[activePlayerIndex]?.[1];
	const isMyTurn = playerEntries[activePlayerIndex]?.[0] === room.sessionId;

	return (
		<div className="page">
			<GameHeader />
			<main className="page-main">
				<Timer secondsLeft={secondsLeft} />
				<PlayerCircle
					players={playerEntries.map(([sessionId, player], index) => ({
						sessionId,
						name: player.name,
						avatarUrl: getAvatarUrl(player.avatarUrl),
						isActive: index === activePlayerIndex,
					}))}
				>
					<CenterWord word={currentWord} direction={arrowDirection} />
				</PlayerCircle>
				<TurnInput isMyTurn={isMyTurn} activePlayerName={activePlayer?.name} />
			</main>
		</div>
	);
}

export default GameView;
