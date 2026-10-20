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
import { getPlayerAngleDeg, formatChatTime, type RevealTone } from "@/pages/GameRoom/components/utils";
import CenterWord from "@/pages/GameRoom/components/CenterWord";
import WinnerReveal from "@/pages/GameRoom/components/WinnerReveal";
import TurnInput from "@/pages/GameRoom/components/TurnInput";
import AutoJoinButton from "@/pages/GameRoom/components/AutoJoinButton";
import JoinButton from "@/pages/GameRoom/components/JoinButton";
import StartGameButton from "@/pages/GameRoom/components/StartGameButton";
import ChatBox, { type ChatTab } from "@/pages/GameRoom/components/ChatBox";
import PlayersList from "@/pages/GameRoom/components/PlayersList";
import KickConfirm from "@/pages/GameRoom/components/KickConfirm";
import MobileDrawer from "@/pages/GameRoom/components/MobileDrawer";
import MobileDrawerTrigger from "@/pages/GameRoom/components/MobileDrawerTrigger";
import { useHasUnread } from "@/pages/GameRoom/components/useHasUnread";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useTranslation } from "react-i18next";

interface GameViewProps {
	room: Room<UndercoverRoom>;
}

function GameView({ room }: GameViewProps) {
	const { t, i18n } = useTranslation();
	const [now, setNow] = useState(() => Date.now());
	const [myWord, setMyWord] = useState("");
	const [drawer, setDrawer] = useState<"chat" | "players" | null>(null);
	const [autoJoin, setAutoJoin] = useState(false);
	const [chatTab, setChatTab] = useState<ChatTab>("chat");
	const [aimedSessionId, setAimedSessionId] = useState<string | null>(null);
	const [kickTargetId, setKickTargetId] = useState<string | null>(null);
	const players = useRoomState(room, (s) => s.players);
	const playerEntries = Object.entries(players ?? {}) as [string, Player][];
	const phase = useRoomState(room, (s) => s.phase);
	const [prevPhase, setPrevPhase] = useState(phase);
	const participants = useRoomState(room, (s) => s.participants);
	const minParticipants = useRoomState(room, (s) => s.minParticipants);
	const turnOrder = useRoomState(room, (s) => s.turnOrder);
	const currentTurnIndex = useRoomState(room, (s) => s.currentTurnIndex);
	const clues = useRoomState(room, (s) => s.clues);
	const round = useRoomState(room, (s) => s.round);
	const votes = useRoomState(room, (s) => s.votes);
	const phaseEndsAt = useRoomState(room, (s) => s.phaseEndsAt) ?? 0;
	const secondsLeft = phaseEndsAt ? Math.max(0, Math.round((phaseEndsAt - now) / 1000)) : 0;
	const isParticipant = participants?.includes(room.sessionId) ?? false;
	const participantEntries = playerEntries.filter(([sessionId]) => participants?.includes(sessionId));
	const activeSessionId = phase === "describing" ? turnOrder?.[currentTurnIndex ?? 0] : undefined;
	const activePlayerIndex = Math.max(
		participantEntries.findIndex(([sessionId]) => sessionId === activeSessionId),
		0,
	);
	const activePlayer = activeSessionId ? players?.[activeSessionId] : undefined;
	const isMyTurn = activeSessionId === room.sessionId;
	const hostSessionId = useRoomState(room, (s) => s.hostSessionId);
	const isHost = hostSessionId === room.sessionId;
	const currentWord = phase === "starting" || phase === "describing" || phase === "voting" ? myWord : "";
	const winner = useRoomState(room, (s) => s.winner);
	const revealedRoles = useRoomState(room, (s) => s.revealedRoles);
	const winningRole = winner === "undercover" ? "undercover" : "civilian";
	const winners = Object.entries(revealedRoles ?? {})
		.filter(([, role]) => role === winningRole)
		.map(([sessionId]) => ({
			sessionId,
			name: players?.[sessionId]?.name ?? "",
			avatarUrl: getAvatarUrl(players?.[sessionId]?.avatarUrl ?? null),
		}));
	const winnerLabel = winner === "undercover" ? t("game.undercoverWins") : t("game.civiliansWin");
	const myVoteTargetId = (votes ?? []).find((vote) => vote.voterSessionId === room.sessionId)?.targetSessionId;
	const canVote = phase === "voting" && isParticipant;
	const voteArrowTargetId = canVote ? (aimedSessionId ?? myVoteTargetId) : undefined;
	const voteArrowTargetIndex = participantEntries.findIndex(([sessionId]) => sessionId === voteArrowTargetId);
	const eliminationHistory = useRoomState(room, (s) => s.eliminationHistory);
	const latestElimination = eliminationHistory?.[(eliminationHistory?.length ?? 1) - 1];
	const lastElimination =
		(phase === "reveal" || phase === "finished") && latestElimination?.round === round ? latestElimination : undefined;
	const eliminatedSessionId = lastElimination?.eliminatedSessionId || undefined;
	const circleEntries = eliminatedSessionId
		? playerEntries.filter(([sessionId]) => participants?.includes(sessionId) || sessionId === eliminatedSessionId)
		: participantEntries;
	const revealTargetIndex = circleEntries.findIndex(([sessionId]) => sessionId === eliminatedSessionId);
	let arrowTargetIndex = activePlayerIndex;
	if (phase === "voting") arrowTargetIndex = voteArrowTargetIndex;
	else if (phase === "reveal") arrowTargetIndex = revealTargetIndex;
	const isArrowIdle = (phase === "voting" || phase === "reveal") && arrowTargetIndex === -1;
	const arrowDirection =
		(phase === "describing" || phase === "voting" || phase === "reveal") && arrowTargetIndex !== -1
			? getPlayerAngleDeg(arrowTargetIndex, circleEntries.length)
			: 0;
	const eliminatedPlayer = eliminatedSessionId ? players?.[eliminatedSessionId] : undefined;
	const revealedRole = lastElimination?.eliminatedRole;
	const isNoElimination = phase === "reveal" && !!lastElimination && !eliminatedSessionId;
	let centerWord = currentWord;
	if (isNoElimination) centerWord = t("game.noElimination");
	else if (phase === "reveal" && revealedRole) centerWord = t(`roles.${revealedRole}`);
	let centerBadgeTone: RevealTone = "victory";
	if (isNoElimination) centerBadgeTone = "neutral";
	else if (revealedRole === "undercover") centerBadgeTone = "defeat";

	useEffect(() => {
		const unsubscribe = room.onMessage("word", ({ word }: { word: string }) => setMyWord(word));
		room.send("getWord", i18n.language);
		return unsubscribe;
	}, [room, i18n.language]);

	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 250);
		return () => clearInterval(interval);
	}, []);

	if (phase !== prevPhase) {
		setPrevPhase(phase);
		if (phase === "starting") setChatTab("log");
	}

	useEffect(() => {
		if (phase === "open" && autoJoin && !isParticipant) {
			room.send("joinGame");
		}
	}, [phase, autoJoin, isParticipant, room]);

	const handleToggleParticipant = () => {
		if (isParticipant) setAutoJoin(false);
		room.send(isParticipant ? "leaveGame" : "joinGame");
	};
	const handleStartGame = () => room.send("startGame");
	const handleSubmitClue = (word: string) => room.send("submitClue", word);
	const handleCastVote = (targetSessionId: string) => room.send("castVote", targetSessionId);
	const clueEntries = (clues ?? []).map((clue, index) => ({
		id: `${clue.sessionId}-${clue.submittedAt}-${index}`,
		name: clue.name,
		word: clue.word,
		round: clue.round,
	}));
	const eliminationEntries = (eliminationHistory ?? [])
		.filter((record) => record.eliminatedSessionId)
		.map((record, index) => ({
			id: `${record.eliminatedSessionId}-${record.round}-${index}`,
			name: record.eliminatedName,
			role: record.eliminatedRole,
			round: record.round,
		}));
	const revealedWords = useRoomState(room, (s) => s.revealedWords);
	const language = i18n.language.slice(0, 2);
	const pickRevealedWord = (role: "civilian" | "undercover") =>
		revealedWords?.[`${role}_${language}`] || revealedWords?.[`${role}_en`] || "";
	const logWords =
		phase === "finished" && revealedWords?.civilian_en
			? { civilian: pickRevealedWord("civilian"), undercover: pickRevealedWord("undercover") }
			: null;
	const chat = useRoomState(room, (s) => s.chat);
	const chatMessages = (chat ?? []).map((message, index) => ({
		id: `${message.sessionId}-${message.sentAt}-${index}`,
		name: message.name,
		text: message.text,
		time: formatChatTime(message.sentAt),
		isSelf: message.sessionId === room.sessionId,
		avatarUrl: getAvatarUrl(players?.[message.sessionId]?.avatarUrl ?? null),
	}));
	const handleSendChat = (text: string) => room.send("chat", text);
	const isDesktop = useMediaQuery("(min-width: 96rem)");
	const isChatBoxVisible = isDesktop || drawer === "chat";
	const chatUnread = useHasUnread(
		chat,
		(message) => message.sentAt,
		room.sessionId,
		isChatBoxVisible && chatTab === "chat",
	);
	const logUnread = useHasUnread(
		clues,
		(clue) => clue.submittedAt,
		room.sessionId,
		isChatBoxVisible && chatTab === "log",
	);
	const unreadTabs = { chat: chatUnread, log: logUnread };
	const handleKick = (sessionId: string) => room.send("kick", sessionId);
	const kickTarget = kickTargetId ? players?.[kickTargetId] : undefined;
	const activePlayerSessionId = phase === "describing" ? participantEntries[activePlayerIndex]?.[0] : undefined;
	const playerList = playerEntries.map(([sessionId, player]) => ({
		sessionId,
		name: player.name,
		avatarUrl: getAvatarUrl(player.avatarUrl),
		isActive: sessionId === activePlayerSessionId,
		isSelf: sessionId === room.sessionId,
		isHost: sessionId === hostSessionId,
		isGuest: player.isGuest,
	}));
	const participantPlayerList = circleEntries.map(([sessionId, player]) => {
		const isSelf = sessionId === room.sessionId;
		const voteCount =
			phase === "voting" ? (votes ?? []).filter((vote) => vote.targetSessionId === sessionId).length : undefined;

		return {
			sessionId,
			name: player.name,
			avatarUrl: getAvatarUrl(player.avatarUrl),
			hintWord: (clues ?? []).find((clue) => clue.sessionId === sessionId && clue.round === round)?.word,
			isActive: sessionId === activePlayerSessionId,
			isSelf,
			voteCount,
			isVoteTarget: canVote && myVoteTargetId === sessionId,
			isAimable: canVote && !isSelf,
			isAimed: canVote && aimedSessionId === sessionId,
			isEliminated:
				sessionId === eliminatedSessionId ||
				(phase === "finished" && !!revealedRoles?.[sessionId] && revealedRoles[sessionId] !== winningRole),
		};
	});

	return (
		<div className="page h-screen overflow-hidden">
			<div aria-hidden className="fixed inset-0 -z-20" style={{ background: "#050721" }} />
			<Header compact wide />
			<main className="flex min-h-0 flex-1 items-stretch justify-center px-5 py-[2vh] sm:px-[10vw] md:items-center md:px-[15vw] md:py-[2vh] 2xl:px-[8vw]">
				<div className="relative flex min-h-0 w-full flex-col items-center justify-center gap-6 text-center md:h-[80vh] 2xl:flex-row 2xl:items-stretch">
					<div className="flex w-full min-h-0 flex-1 flex-col items-center gap-6 2xl:w-auto">
						<div className="z-10 flex w-full shrink-0 items-center justify-between px-6 pt-6 md:px-0 md:pt-0">
							<Timer secondsLeft={secondsLeft} />
							<div className="flex items-center gap-3 2xl:hidden">
								<MobileDrawerTrigger
									icon={MessageCircle}
									label={t("game.openChat")}
									hasUnread={chatUnread || logUnread}
									onClick={() => setDrawer("chat")}
								/>
								<MobileDrawerTrigger
									icon={Users}
									label={t("game.openPlayers")}
									onClick={() => setDrawer("players")}
								/>
							</div>
						</div>
						<div className="relative flex min-h-0 flex-1 w-full items-center justify-center md:-translate-y-[6.5vh] 2xl:translate-x-[4vw]">
							<PlayerCircle
								players={participantPlayerList}
								onAim={setAimedSessionId}
								onSelect={handleCastVote}
								safeRevealStartMs={isNoElimination ? 1100 : undefined}
							>
								{phase === "finished" ? (
									<WinnerReveal
										winners={winners}
										label={winnerLabel}
										tone={winner === "undercover" ? "defeat" : "victory"}
									/>
								) : (
									<CenterWord
										word={centerWord}
										direction={arrowDirection}
										dimmed={isArrowIdle && !isNoElimination}
										badgeTone={
											phase === "reveal" && (revealedRole || isNoElimination) ? centerBadgeTone : undefined
										}
										avatarUrl={eliminatedPlayer ? getAvatarUrl(eliminatedPlayer.avatarUrl ?? null) : undefined}
										avatarName={eliminatedPlayer?.name}
									/>
								)}
							</PlayerCircle>
						</div>
						<div className="pointer-events-none relative z-20 flex min-h-[9rem] w-full shrink-0 flex-col items-center justify-end gap-4 px-6 pb-6 md:px-0 md:pb-0 2xl:grid 2xl:grid-cols-3 2xl:items-end md:gap-6">
							{phase === "open" && (
								<div className="pointer-events-auto flex items-end gap-3 2xl:col-start-1 2xl:mx-auto">
									<JoinButton isParticipant={isParticipant} onClick={handleToggleParticipant} />
									{isHost && (
										<StartGameButton
											onClick={handleStartGame}
											disabled={(participants?.length ?? 0) < (minParticipants ?? 0)}
										/>
									)}
								</div>
							)}
							{(phase === "describing" || phase === "voting") && (
								<>
									{phase === "describing" && isParticipant && (
										<div className="pointer-events-auto order-1 min-w-0 w-full 2xl:order-2 2xl:col-start-2 2xl:w-auto 2xl:max-w-xl 2xl:mx-auto 2xl:translate-x-[4vw] flex flex-col gap-4">
											<TurnInput
												isMyTurn={isMyTurn}
												activePlayerName={activePlayer?.name}
												onSubmit={handleSubmitClue}
											/>
										</div>
									)}
									<div className="pointer-events-auto order-2 mb-[max(1vw,12px)] flex flex-col items-center gap-3 md:items-start md:self-start 2xl:order-1 2xl:col-start-1 2xl:self-end">
										<AutoJoinButton enabled={autoJoin} onToggle={() => setAutoJoin((current) => !current)} />
									</div>
								</>
							)}
						</div>
					</div>
					<aside className="hidden min-h-0 h-full w-full flex-col items-center gap-4 2xl:flex 2xl:w-[380px]">
						<div className="w-full h-[70%] min-h-0">
							<ChatBox
								messages={chatMessages}
								clues={clueEntries}
								eliminations={eliminationEntries}
								words={logWords}
								tab={chatTab}
								unread={unreadTabs}
								onTabChange={setChatTab}
								onSend={handleSendChat}
							/>
						</div>
						<div className="w-full h-[30%] min-h-0 overflow-y-auto">
							<PlayersList players={playerList} isHost={isHost} onKick={setKickTargetId} />
						</div>
					</aside>
				</div>
			</main>
			<MobileDrawer open={drawer === "chat"} onClose={() => setDrawer(null)}>
				<ChatBox
					messages={chatMessages}
					clues={clueEntries}
					eliminations={eliminationEntries}
					words={logWords}
					tab={chatTab}
					unread={unreadTabs}
					onTabChange={setChatTab}
					onSend={handleSendChat}
				/>
			</MobileDrawer>
			<MobileDrawer open={drawer === "players"} onClose={() => setDrawer(null)}>
				<PlayersList players={playerList} isHost={isHost} onKick={setKickTargetId} />
			</MobileDrawer>
			{kickTargetId && kickTarget && (
				<KickConfirm
					name={kickTarget.name}
					onClose={() => setKickTargetId(null)}
					onConfirm={() => handleKick(kickTargetId)}
				/>
			)}
		</div>
	);
}

export default GameView;
