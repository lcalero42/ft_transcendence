import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom, useRoomState } from "@colyseus/react";
import type { SeatReservation } from "@colyseus/sdk";
import type { UndercoverRoom } from "@back/colyseus/rooms/UndercoverRoom";
import { toast } from "@/components/ui/toast";
import { client } from "@/lib/colyseusClient";
import { getToken } from "@/api/auth/client";
import {
	clearReconnection,
	readStoredReconnection,
	storeReconnection,
} from "@/lib/roomReconnection";
import { useAuth } from "@/context/useAuth";
import DefaultAvatar from "@/assets/profile-photo/moon.png";
import Header from "../../components/Header/Header";
import FriendList from "../Profile/components/FriendList/FriendList";
import PlayerList from "./components/PlayerList";
import LoadPage from "@/components/LoadPage/LoadPage";
import ErrorPage from "@/components/ErrorPage/ErrorPage";
import { useTranslation } from "react-i18next";

function resolveAvatar(avatarUrl: string) {
	return avatarUrl ? `${import.meta.env.VITE_API_URL}${avatarUrl}` : DefaultAvatar;
}

export default function CreateRoom() {
	const { profile, profileLoading } = useAuth();
	const { roomId: routeRoomId } = useParams();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const targetRoomIdRef = useRef(routeRoomId);

	const { room, error, isConnecting } = useRoom(
		profileLoading
			? null
			: async () => {
					const targetRoomId = targetRoomIdRef.current;
					const stored = readStoredReconnection();
					if (stored && (!targetRoomId || stored.roomId === targetRoomId)) {
						try {
							return await client.reconnect<UndercoverRoom>(stored.token);
						} catch {
							clearReconnection();
						}
					}
					client.auth.token = getToken() ?? "";
					const options = { name: profile?.name, avatarUrl: profile?.avatarUrl, lang: i18n.language };
					return targetRoomId
						? client.joinById<UndercoverRoom>(targetRoomId, options)
						: client.create<UndercoverRoom>("undercover", options);
				},
		[profileLoading],
	);

	const players = useRoomState(room, (s) => s.players);
	const hostSessionId = useRoomState(room, (s) => s.hostSessionId);
	const maxClients = useRoomState(room, (s) => s.maxParticipants);

	useEffect(() => {
		if (!room) return;
		storeReconnection(room);
		if (routeRoomId !== room.roomId) {
			void navigate(`/create-room/${room.roomId}`, { replace: true });
		}
	}, [room, routeRoomId, navigate]);

	// The server issues a new reconnection token on every join, and the SDK's
	// automatic retry rewrites it on the same room object, so re-store it.
	useEffect(() => {
		if (!room) return;
		const onReconnect = () => storeReconnection(room);
		room.onReconnect(onReconnect);
		return () => room.onReconnect.remove(onReconnect);
	}, [room]);

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
			description: error.message,
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
		toast.add({
			type: "success",
			title: t("lobby.linkCopiedTitle"),
			description: t("lobby.linkCopiedDescription"),
		});
	};

	const handleStart = () => {
		room.send("start");
	};

	const friends = [
		{ id: 1, name: "bob", icon: "🤠​", isOnLine: true },
		{ id: 2, name: "QueMp4", icon: "🦒", isOnLine: false },
		{ id: 3, name: "MichaelKarate135", icon: "🦒", isOnLine: true },
		{ id: 4, name: "QueMp4", icon: "🦒", isOnLine: false },
		{ id: 5, name: "QueMp4", icon: "🦒", isOnLine: false },
		{ id: 6, name: "QueMp4", icon: "🦒", isOnLine: false },
		{ id: 7, name: "jiraaaaf", icon: "🦒", isOnLine: true },
		{ id: 8, name: "MichaelKarate135", icon: "🦒", isOnLine: true },
		{ id: 9, name: "MichaelKarate135", icon: "🦒", isOnLine: true },
	];

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
					<div className="w-screen flex flex-col items-center gap-3 py-6">
						<button
							onClick={() => void handleCopy()}
							className="clean-btn hoverable rounded-lg bg-linear-to-r from-btn-gradient-start to-btn-gradient-end px-4 py-2 text-sm text-white whitespace-nowrap sm:px-6 sm:py-3 sm:text-base"
						>
							{t("lobby.copyLink")}
						</button>
						<p>{t("lobby.inviteHint")}</p>
					</div>
					<div className="px-[10vw] py-5 md:flex">
						<div className="w-full md:flex md:justify-center">
							<FriendList friends={friends} />
						</div>
						<div className="w-full md:flex md:justify-center">
							<PlayerList players={roomPlayers} maxPlayers={maxClients ?? 0} />
						</div>
					</div>
				</div>

				{isHost && <div className="max-w-2xl m-10 mx-auto flex flex-1 items-center justify-center">
					<button
						onClick={handleStart}
						className="clean-btn hoverable btn-glow-start rounded-lg bg-linear-to-r from-start-gradient-start to-start-gradient-end px-6 py-3 text-base font-bold text-black"
					>
						{t("lobby.start")}
					</button>
				</div>}
			</main>
		</div>
	);
}
