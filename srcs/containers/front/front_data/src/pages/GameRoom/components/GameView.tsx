import { useEffect, useState } from "react";
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
import JoinButton from "@/pages/GameRoom/components/JoinButton";
import StartGameButton from "@/pages/GameRoom/components/StartGameButton";
import EndGameButton from "@/pages/GameRoom/components/EndGameButton";
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
	const [autoJoin, setAutoJoin] = useState(false);
	const players = useRoomState(room, (s) => s.players);
	const playerEntries = Object.entries(players ?? {}) as [string, Player][];
	const phase = useRoomState(room, (s) => s.phase);
	const participants = useRoomState(room, (s) => s.participants);
	const minParticipants = useRoomState(room, (s) => s.minParticipants);
	const isParticipant = participants?.includes(room.sessionId) ?? false;
	const participantEntries = playerEntries.filter(([sessionId]) => participants?.includes(sessionId));
	const arrowDirection = getPlayerAngleDeg(activePlayerIndex, participantEntries.length);
	const activePlayer = participantEntries[activePlayerIndex]?.[1];
	const isMyTurn = participantEntries[activePlayerIndex]?.[0] === room.sessionId;
	const hostSessionId = useRoomState(room, (s) => s.hostSessionId);
	const isHost = hostSessionId === room.sessionId;

	useEffect(() => {
		if (phase === "open" && autoJoin && !isParticipant) {
			room.send("joinGame");
			setAutoJoin(false);
		}
	}, [phase]);

	const handleToggleParticipant = () => room.send(isParticipant ? "leaveGame" : "joinGame");
	const handleStartGame = () => room.send("startGame");
	const handleEndGame = () => room.send("endGame");
	const chat = useRoomState(room, (s) => s.chat);
	const chatMessages = (chat ?? []).map((message, index) => ({
		id: `${message.sessionId}-${message.sentAt}-${index}`,
		name: message.name,
		text: message.text,
		time: formatChatTime(message.sentAt),
		avatarUrl: getAvatarUrl(players?.[message.sessionId]?.avatarUrl ?? null),
	}));
	const handleSendChat = (text: string) => room.send("chat", text);
	const activePlayerSessionId = participantEntries[activePlayerIndex]?.[0];
	const playerList = playerEntries.map(([sessionId, player]) => ({
		sessionId,
		name: player.name,
		avatarUrl: getAvatarUrl(player.avatarUrl),
		isActive: sessionId === activePlayerSessionId,
		isSelf: sessionId === room.sessionId,
	}));
	const participantPlayerList = participantEntries.map(([sessionId, player]) => ({
		sessionId,
		name: player.name,
		avatarUrl: getAvatarUrl(player.avatarUrl),
		isActive: sessionId === activePlayerSessionId,
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
							<PlayerCircle players={participantPlayerList}>
								<CenterWord word={currentWord} direction={arrowDirection} />
							</PlayerCircle>
						</div>
						<div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-end lg:justify-between md:gap-6">
							{phase === "open" && (
								<div className="mb-[max(1vw,12px)] flex items-center gap-3">
									<JoinButton isParticipant={isParticipant} onClick={handleToggleParticipant} />
									{isHost && (
										<StartGameButton
											onClick={handleStartGame}
											disabled={(participants?.length ?? 0) < (minParticipants ?? 0)}
										/>
									)}
								</div>
							)}
							{phase === "playing" && (
								<>
									<div className="order-1 min-w-0 w-full lg:order-2 lg:w-auto lg:max-w-xl">
										<TurnInput isMyTurn={isMyTurn} activePlayerName={activePlayer?.name} />
									</div>
									<div className="order-2 mb-[max(1vw,12px)] flex items-center gap-3 lg:order-1">
										<AutoJoinButton enabled={autoJoin} onToggle={() => setAutoJoin((current) => !current)} />
										{isHost && <EndGameButton onClick={handleEndGame} />}
									</div>
								</>
							)}
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
