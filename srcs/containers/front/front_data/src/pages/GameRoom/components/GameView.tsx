import type { Room } from "@colyseus/sdk";
import { useRoomState } from "@colyseus/react";
import type { Rooms } from "@back/colyseus/rooms/Rooms";
import { getAvatarUrl } from "@/api/player";
import GameHeader from "@/pages/GameRoom/components/GameHeader";
import Timer from "@/pages/GameRoom/components/Timer";
import PlayerCircle, { getPlayerAngleDeg } from "@/pages/GameRoom/components/PlayerCircle";
import CenterWord from "@/pages/GameRoom/components/CenterWord";
import TurnInput from "@/pages/GameRoom/components/TurnInput";
import AutoJoinButton from "@/pages/GameRoom/components/AutoJoinButton";
import LeaveButton from "@/pages/GameRoom/components/LeaveButton";
import ChatBox from "@/pages/GameRoom/components/ChatBox";

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
	const chatMessages = [
		{ id: "1", name: activePlayer?.name ?? "mastermind", text: "Hello à tous ! Je suis le meyeur.", time: "21:42" },
	];

	return (
		<div className="page">
			<GameHeader />
			<main className="flex-1 px-[10vw] py-[2vh] md:px-[15vw] md:py-[10vh]">
				<div className="grid gap-8 text-center lg:grid-cols-[1fr_320px]">
					<div className="flex flex-col gap-6">
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
						<div className="flex items-center justify-between gap-4">
							<AutoJoinButton />
							<div className="min-w-0 flex-1">
								<TurnInput isMyTurn={isMyTurn} activePlayerName={activePlayer?.name} />
							</div>
							<LeaveButton />
						</div>
					</div>
					<aside className="flex flex-col gap-6">
						<ChatBox messages={chatMessages} />
					</aside>
				</div>
			</main>
		</div>
	);
}

export default GameView;
