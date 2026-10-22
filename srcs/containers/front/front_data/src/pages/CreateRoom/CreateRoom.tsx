import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom, useRoomState } from "@colyseus/react";
import type { SeatReservation } from "@colyseus/sdk";
import type { UndercoverState } from "@back/colyseus/rooms/UndercoverState";
import { toast } from "@/components/ui/toast";
import { client } from "@/lib/colyseusClient";
import {
	clearReconnection,
	readStoredReconnection,
	storeReconnection,
} from "@/lib/roomReconnection";
import { useAuth } from "@/context/useAuth";
import { joinErrorMessage, useSeatTakenOver } from "@/lib/useSeatTakenOver";
import DefaultAvatar from "@/assets/profile-photo/moon.png";
import Header from "../../components/Header/Header";
import InviteFriendList from "./components/InviteFriendList";
import PlayerList from "./components/PlayerList";
import LoadPage from "@/components/LoadPage/LoadPage";
import ErrorPage from "@/components/ErrorPage/ErrorPage";
import { useTranslation } from "react-i18next";
import { Check, Copy } from "lucide-react";
import { useFriends } from "@/context/useFriends";
import { useFriendPlayers } from "@/context/useFriendPlayers";

function resolveAvatar(avatarUrl: string) {
	return avatarUrl ? `${import.meta.env.VITE_API_URL}${avatarUrl}` : DefaultAvatar;
}

export default function CreateRoom() {
	const { profileLoading, isGuest } = useAuth();
	const { roomId: routeRoomId } = useParams();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const { friendsStatus, retryFriends } = useFriends();
	const friends = useFriendPlayers();
	const targetRoomIdRef = useRef(routeRoomId);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timeout = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(timeout);
	}, [copied]);

	const { room, error, isConnecting } = useRoom(
		profileLoading
			? null
			: async () => {
				const targetRoomId = targetRoomIdRef.current;
				const stored = readStoredReconnection();
				if (stored && (!targetRoomId || stored.roomId === targetRoomId)) {
					try {
						return await client.reconnect<UndercoverState>(stored.token);
					} catch {
						clearReconnection();
					}
				}
				const options = { lang: i18n.language };
				return targetRoomId
					? client.joinById<UndercoverState>(targetRoomId, options)
					: client.create<UndercoverState>("undercover", options);
			},
		[profileLoading],
	);

	const players = useRoomState(room, (s) => s.players);
	const hostSessionId = useRoomState(room, (s) => s.hostSessionId);
	const maxClients = useRoomState(room, (s) => s.maxParticipants);
	const phase = useRoomState(room, (s) => s.phase);

	useEffect(() => {
		if (!room) return;
		return room.onMessage("inviteResult", ({ ok, code }: { ok: boolean; code?: string }) => {
			const errors: Record<string, string> = {
				ROOM_FULL: "lobby.errRoomFull",
				GAME_STARTED: "lobby.errGameStarted",
				ALREADY_IN_ROOM: "lobby.errAlreadyIn",
				NOT_FRIEND: "lobby.errNotFriend",
				FRIEND_UNAVAILABLE: "lobby.errUnavailable",
			};
			if (ok) {
				toast.add({ type: "success", title: t("lobby.inviteSent") });
			} else {
				toast.add({ type: "error", title: t(errors[code ?? ""] ?? "lobby.errFailed") });
			}
		});
	}, [room, t]);

	useEffect(() => {
		if (!room) return;
		return room.onMessage("startError", () => {
			toast.add({ type: "error", title: t("game.errNotSaved") });
		});
	}, [room, t]);
	const joinedPhaseRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (!room) return;
		storeReconnection(room);
		if (routeRoomId !== room.roomId) {
			void navigate(`/create-room/${room.roomId}`, { replace: true });
		}
	}, [room, routeRoomId, navigate]);

	useEffect(() => {
		if (!room || !phase) return;
		joinedPhaseRef.current ??= phase;
		if (joinedPhaseRef.current !== "setup") {
			void navigate(`/game/${room.roomId}`, { replace: true });
		}
	}, [room, phase, navigate]);

	useEffect(() => {
		if (!room) return;
		const onReconnect = () => storeReconnection(room);
		room.onReconnect(onReconnect);
		return () => room.onReconnect.remove(onReconnect);
	}, [room]);

	useSeatTakenOver(room);

	useEffect(() => {
		if (!room) return;
		return room.onMessage("seatReservation", (reservation: SeatReservation) => {
			clearReconnection();
			void navigate(`/game/${reservation.roomId}`, { state: { reservation } });
		});
	}, [room, navigate]);

	useEffect(() => {
		if (!error) return;
		clearReconnection();
		toast.add({
			type: "error",
			title: t("lobby.joinError"),
			description: joinErrorMessage(error, t),
		});
		void navigate("/home", { replace: true });
	}, [error, navigate, t]);

	if (profileLoading) return <LoadPage text={t("common.connecting")} />;
	if (isConnecting) return <LoadPage text={t("common.connecting")} />;
	if (error) return null;
	if (!room) return <ErrorPage error={t("lobby.unavailable")} />;

	const inviteLink = `${window.location.origin}/create-room/${room.roomId}`;
	const playerEntries = Object.entries(players ?? {});
	const isHost = room.sessionId === hostSessionId;

	const missingPlayers = Math.max((maxClients ?? 0) - playerEntries.length, 0);

	const roomPlayers = playerEntries.map(([sessionId, player]) => ({
		sessionId,
		name: player.name,
		avatarUrl: resolveAvatar(player.avatarUrl),
		isHost: sessionId === hostSessionId,
		isMe: sessionId === room.sessionId,
	}));

	const handleCopy = async () => {
		await navigator.clipboard.writeText(inviteLink);
		setCopied(true);
	};

	const handleStart = () => {
		room.send("start");
	};

	const playerIdsInRoom = new Set(playerEntries.map(([, p]) => p.playerId));
	const onlineFriends = friends
		.filter((f) => f.isOnline)
		.map((f) => ({
			id: f.id,
			name: f.name,
			avatarUrl: resolveAvatar(f.avatarUrl ?? ""),
			inRoom: playerIdsInRoom.has(f.id),
		}));
	const inviteDisabled = phase !== "setup" || playerEntries.length >= (maxClients ?? 0);

	const handleInvite = (friendId: number) => {
		room.send("inviteFriend", { friendId });
	};

	return (
		<div className="page">
			<Header />
			<main className="flex flex-1 flex-col">
				<div className="h-[7vh] w-screen flex items-center justify-center bg-banner-bg">
					<p className="text-sm">
						{missingPlayers > 0
							? t("lobby.waiting", { count: missingPlayers })
							: t("lobby.full")}
					</p>
				</div>
				<div>
					<div className="w-screen flex flex-col items-center gap-3 pt-10">
						<button
							onClick={() => void handleCopy()}
							className={`clean-btn flex items-center gap-2 rounded-lg border py-1.5 pl-1.5 pr-4 text-xs md:gap-3 md:py-2 md:pl-2 md:pr-5 font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,scale] duration-200 ease-in-out active:scale-95 sm:text-sm md:text-base ${copied ? "border-victory bg-transparent text-victory" : "border-card-accent-border bg-card text-gray-high hover:border-stroke-accent hover:bg-transparent hover:text-accent-purple hover:shadow-[0_0_18px_color-mix(in_srgb,var(--color-stroke-accent)_30%,transparent)]"}`}
						>
							<span className={`flex size-6 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-in-out sm:size-7 md:size-9 ${copied ? "bg-victory text-black" : "bg-circle-bg text-accent-purple"}`}>
								{copied ? <Check className="size-3.5 sm:size-4 md:size-5" /> : <Copy className="size-3.5 sm:size-4 md:size-5" />}
							</span>
							<span aria-live="polite">{copied ? t("lobby.linkCopiedTitle") : t("lobby.copyLink")}</span>
						</button>
					</div>
					<div className="flex flex-col gap-1 px-[10vw] pt-10 pb-5 md:flex-row md:gap-6">
						{!isGuest && (
							<div className="w-full md:flex md:justify-end">
								<InviteFriendList
									friends={onlineFriends}
									status={friendsStatus}
									onRetry={retryFriends}
									disabled={inviteDisabled}
									onInvite={handleInvite}
								/>
							</div>
						)}
						<div className={`w-full md:flex ${isGuest ? "md:justify-center" : "md:justify-start"}`}>
							<PlayerList players={roomPlayers} maxPlayers={maxClients ?? 0} />
						</div>
					</div >
				</div >

				{isHost && <div className="flex justify-center pb-10">
					<button
						onClick={handleStart}
						className="clean-btn transition-[color,box-shadow] duration-200 ease-in-out hover:shadow-[0_0_18px_color-mix(in_srgb,var(--color-start-gradient-start)_30%,transparent)] relative isolate rounded-lg border border-start-gradient-start bg-transparent px-6 py-3 text-base font-bold text-black hover:text-start-gradient-start before:absolute before:-inset-px before:-z-10 before:rounded-lg before:bg-linear-to-r before:from-start-gradient-start before:to-start-gradient-end before:transition-opacity before:duration-200 before:ease-in-out hover:before:opacity-0"
					>
						{t("lobby.start")}
					</button>
				</div>
				}
			</main >
		</div >
	);
}
