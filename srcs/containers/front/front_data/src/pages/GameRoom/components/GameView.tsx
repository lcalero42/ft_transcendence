import { useState } from "react";
import { MessageCircle, Users } from "lucide-react";
import type { Room } from "@colyseus/sdk";
import { useRoomState } from "@colyseus/react";
import type { UndercoverRoom } from "@back/colyseus/rooms/UndercoverRoom";
import type { Player } from "@back/colyseus/rooms/UndercoverState";
import { getAvatarUrl } from "@/api/player";
import Header from "@/components/Header/Header";
import Timer from "@/pages/GameRoom/components/Timer";
import PlayerCircle from "@/pages/GameRoom/components/PlayerCircle";
import { getPlayerAngleDeg, formatChatTime } from "@/pages/GameRoom/components/utils";
import CenterWord from "@/pages/GameRoom/components/CenterWord";
import TurnInput from "@/pages/GameRoom/components/TurnInput";
import AutoJoinButton from "@/pages/GameRoom/components/AutoJoinButton";
import LeaveButton from "@/pages/GameRoom/components/LeaveButton";
import ChatBox from "@/pages/GameRoom/components/ChatBox";
import PlayersList from "@/pages/GameRoom/components/PlayersList";
import MobileDrawer from "@/pages/GameRoom/components/MobileDrawer";
import MobileDrawerTrigger from "@/pages/GameRoom/components/MobileDrawerTrigger";

interface GameViewProps {
	room: Room<UndercoverRoom>;
}

function GameView({ room }: GameViewProps) {
	const secondsLeft = 20;
	const currentWord = "PLUME";
	const activePlayerIndex = 0;
	const [drawer, setDrawer] = useState<"chat" | "players" | null>(null);
	const players = useRoomState(room, (s) => s.players);
	const playerEntries = Object.entries(players ?? {}) as [string, Player][];
	const arrowDirection = getPlayerAngleDeg(activePlayerIndex, playerEntries.length);
	const activePlayer = playerEntries[activePlayerIndex]?.[1];
	const isMyTurn = playerEntries[activePlayerIndex]?.[0] === room.sessionId;
	const hostSessionId = useRoomState(room, (s) => s.hostSessionId);
	const isHost = hostSessionId === room.sessionId;
	const chat = useRoomState(room, (s) => s.chat);
	const chatMessages = (chat ?? []).map((message, index) => ({
		id: `${message.sessionId}-${message.sentAt}-${index}`,
		name: message.name,
		text: message.text,
		time: formatChatTime(message.sentAt),
		avatarUrl: getAvatarUrl(players?.[message.sessionId]?.avatarUrl ?? null),
	}));
	const handleSendChat = (text: string) => room.send("chat", text);
	const playerList = playerEntries.map(([sessionId, player], index) => ({
		sessionId,
		name: player.name,
		avatarUrl: getAvatarUrl(player.avatarUrl),
		isActive: index === activePlayerIndex,
		isSelf: sessionId === room.sessionId,
	}));

	return (
		<div className="page h-screen overflow-hidden">
			<Header compact />
			<main className="flex min-h-0 flex-1 items-center justify-center px-[10vw] py-[2vh] md:px-[15vw] md:py-[2vh]">
				<div className="relative flex h-[70vh] min-h-0 w-full flex-col items-center justify-center gap-6 text-center lg:flex-row lg:items-stretch">
					<div className="flex w-full min-h-0 flex-1 flex-col items-center gap-4 lg:w-auto">
						<div className="relative flex min-h-0 flex-1 w-full items-center justify-center">
							<div className="absolute top-0 left-0">
								<Timer secondsLeft={secondsLeft} />
							</div>
							<div className="absolute top-0 right-0 z-10 flex items-center gap-3 lg:hidden">
								<MobileDrawerTrigger
									icon={MessageCircle}
									label="Open chat"
									onClick={() => setDrawer("chat")}
								/>
								<MobileDrawerTrigger
									icon={Users}
									label="Open players list"
									onClick={() => setDrawer("players")}
								/>
							</div>
							<PlayerCircle players={playerList}>
								<CenterWord word={currentWord} direction={arrowDirection} />
							</PlayerCircle>
						</div>
						<div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-end lg:justify-between md:gap-6">
							<div className="order-1 min-w-0 w-full lg:order-2 lg:w-auto lg:max-w-xl">
								<TurnInput isMyTurn={isMyTurn} activePlayerName={activePlayer?.name} />
							</div>
							<div className="order-2 flex w-full items-center justify-between gap-4 lg:contents">
								<div className="mb-[max(1vw,12px)] lg:order-1">
									<AutoJoinButton />
								</div>
								<div className="mb-[max(1vw,12px)] lg:order-3">
									<LeaveButton />
								</div>
							</div>
						</div>
					</div>
					<aside className="hidden min-h-0 h-full w-full flex-col items-center gap-4 lg:flex lg:w-[400px]">
						<div className="w-full h-[70%] min-h-0">
							<ChatBox messages={chatMessages} onSend={handleSendChat} />
						</div>
						<div className="w-full h-[30%] min-h-0 overflow-y-auto">
							<PlayersList players={playerList} isHost={isHost} />
						</div>
					</aside>
				</div>
			</main>
			<MobileDrawer open={drawer === "chat"} onClose={() => setDrawer(null)}>
				<ChatBox messages={chatMessages} onSend={handleSendChat} />
			</MobileDrawer>
			<MobileDrawer open={drawer === "players"} onClose={() => setDrawer(null)}>
				<PlayersList players={playerList} isHost={isHost} />
			</MobileDrawer>
		</div>
	);
}

export default GameView;
