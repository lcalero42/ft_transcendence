import { useState } from "react";
import { MessageCircle, Users } from "lucide-react";
import type { Room } from "@colyseus/sdk";
import { useRoomState } from "@colyseus/react";
import type { Rooms } from "@back/colyseus/rooms/Rooms";
import type { Player } from "@back/colyseus/rooms/RoomState";
import { getAvatarUrl } from "@/api/player";
import GameHeader from "@/pages/GameRoom/components/GameHeader";
import Timer from "@/pages/GameRoom/components/Timer";
import PlayerCircle, { getPlayerAngleDeg } from "@/pages/GameRoom/components/PlayerCircle";
import CenterWord from "@/pages/GameRoom/components/CenterWord";
import TurnInput from "@/pages/GameRoom/components/TurnInput";
import AutoJoinButton from "@/pages/GameRoom/components/AutoJoinButton";
import LeaveButton from "@/pages/GameRoom/components/LeaveButton";
import ChatBox from "@/pages/GameRoom/components/ChatBox";
import PlayersList from "@/pages/GameRoom/components/PlayersList";
import MobileDrawer from "@/pages/GameRoom/components/MobileDrawer";
import MobileDrawerTrigger from "@/pages/GameRoom/components/MobileDrawerTrigger";

interface GameViewProps {
	room: Room<Rooms>;
}

function GameView({ room }: GameViewProps) {
	const secondsLeft = 20;
	const currentWord = "PLUME";
	const activePlayerIndex = 1;
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isPlayersOpen, setIsPlayersOpen] = useState(false);
	const players = useRoomState(room, (s) => s.players);
	const playerEntries = Object.entries(players ?? {}) as [string, Player][];
	const arrowDirection = getPlayerAngleDeg(activePlayerIndex, playerEntries.length);
	const activePlayer = playerEntries[activePlayerIndex]?.[1];
	const isMyTurn = playerEntries[activePlayerIndex]?.[0] === room.sessionId;
	const isHost = playerEntries.find(([sessionId]) => sessionId === room.sessionId)?.[1]?.isHost === true;
	const chatMessages = [
		{ id: "1", name: activePlayer?.name ?? "mastermind", text: "Hello à tous ! Je suis le meyeur.", time: "21:42" },
	];
	const playersListEntries = playerEntries.map(([sessionId, player]) => ({
		sessionId,
		name: player.name,
		avatarUrl: getAvatarUrl(player.avatarUrl),
		isSelf: sessionId === room.sessionId,
		canKick: isHost,
	}));

	return (
		<div className="page h-screen overflow-hidden">
			<GameHeader />
			<main className="flex min-h-0 flex-1 items-center justify-center px-[10vw] py-[2vh] md:px-[15vw] md:py-[2vh]">
				<div className="relative flex h-[70vh] max-h-[70vh] min-h-0 w-full flex-col items-center justify-center gap-6 text-center lg:flex-row lg:items-stretch">
					<div className="absolute top-0 right-0 z-10 flex items-center gap-3 lg:hidden">
						<MobileDrawerTrigger
							icon={MessageCircle}
							label="Ouvrir le chat"
							onClick={() => {
								setIsChatOpen(true);
								setIsPlayersOpen(false);
							}}
						/>
						<MobileDrawerTrigger
							icon={Users}
							label="Ouvrir la liste des joueurs"
							onClick={() => {
								setIsPlayersOpen(true);
								setIsChatOpen(false);
							}}
						/>
					</div>
					<div className="flex min-h-0 flex-1 flex-col items-center gap-4">
						<div className="relative flex min-h-0 flex-1 w-full items-center justify-center">
							<div className="absolute top-0 left-0">
								<Timer secondsLeft={secondsLeft} />
							</div>
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
						</div>
						<div className="flex w-full items-end justify-between gap-4 md:gap-6">
							<div className="mb-[max(1vw,12px)]">
								<AutoJoinButton />
							</div>
							<div className="min-w-0 max-w-xl">
								<TurnInput isMyTurn={isMyTurn} activePlayerName={activePlayer?.name} />
							</div>
							<div className="mb-[max(1vw,12px)]">
								<LeaveButton />
							</div>
						</div>
					</div>
					<aside className="hidden min-h-0 h-full w-full flex-col items-center gap-4 lg:flex lg:w-[400px]">
						<div className="w-full h-[70%] min-h-0">
							<ChatBox messages={chatMessages} />
						</div>
						<div className="w-full h-[30%] min-h-0 overflow-y-auto">
							<PlayersList players={playersListEntries} />
						</div>
					</aside>
				</div>
			</main>
			<MobileDrawer open={isChatOpen} onClose={() => setIsChatOpen(false)} title="Chat">
				<ChatBox messages={chatMessages} />
			</MobileDrawer>
			<MobileDrawer open={isPlayersOpen} onClose={() => setIsPlayersOpen(false)} title="Players">
				<PlayersList players={playersListEntries} />
			</MobileDrawer>
		</div>
	);
}

export default GameView;
