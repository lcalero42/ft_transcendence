import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom, useRoomState } from "@colyseus/react";
import type { Room, SeatReservation } from "@colyseus/sdk";
import type { LobbyRoom } from "@back/colyseus/rooms/LobbyRoom";
import { client } from "@/lib/colyseusClient";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/useAuth";
import DefaultAvatar from "@/assets/profile-photo/moon.png";
import LinkProfile from "../../components/LinkProfile/LinkProfile";
import Logo from "../../components/Logo/Logo";
import FriendList from "../Profile/components/FriendList/FriendList";
import PlayerList from "./components/PlayerList";

function resolveAvatar(avatarUrl: string) {
	return avatarUrl ? `${import.meta.env.VITE_API_URL}${avatarUrl}` : DefaultAvatar;
}

const RECONNECTION_STORAGE_KEY = "lobby-reconnection";

function readStoredReconnection(): { roomId: string; token: string } | null {
	try {
		const raw = sessionStorage.getItem(RECONNECTION_STORAGE_KEY);
		return raw ? (JSON.parse(raw) as { roomId: string; token: string }) : null;
	} catch {
		return null;
	}
}

function storeReconnection(room: Room) {
	try {
		sessionStorage.setItem(
			RECONNECTION_STORAGE_KEY,
			JSON.stringify({ roomId: room.roomId, token: room.reconnectionToken }),
		);
	} catch {
		// ignore storage failures (e.g. private browsing)
	}
}

function clearReconnection() {
	try {
		sessionStorage.removeItem(RECONNECTION_STORAGE_KEY);
	} catch {
		// ignore storage failures
	}
}

export default function CreateRoom() {
	const { profile, profileLoading } = useAuth();
	const { roomId: routeRoomId } = useParams();
	const navigate = useNavigate();

	// Frozen at mount so that our own `navigate()` call below (which updates
	// the URL to include the created room's id) doesn't retrigger useRoom.
	const targetRoomIdRef = useRef(routeRoomId);

	const { room, error, isConnecting } = useRoom(
		profileLoading
			? null
			: async () => {
				const targetRoomId = targetRoomIdRef.current;
				const stored = readStoredReconnection();
				if (stored && (!targetRoomId || stored.roomId === targetRoomId)) {
					try {
						return await client.reconnect<LobbyRoom>(stored.token);
					} catch {
						clearReconnection();
					}
				}
				return targetRoomId
					? client.joinById<LobbyRoom>(targetRoomId, { name: profile?.name, avatarUrl: profile?.avatarUrl })
					: client.create<LobbyRoom>("lobby", { name: profile?.name, avatarUrl: profile?.avatarUrl });
			},
		[profileLoading],
	);

	const players = useRoomState(room, (s) => s.players);
	const hostSessionId = useRoomState(room, (s) => s.hostSessionId);
	const maxClients = useRoomState(room, (s) => s.maxClients);

	useEffect(() => {
		if (!room) return;
		storeReconnection(room);
		if (routeRoomId !== room.roomId) {
			void navigate(`/create-room/${room.roomId}`, { replace: true });
		}
	}, [room, routeRoomId, navigate]);

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
			title: "Unable to join the game",
			description: error.message,
		});
		void navigate("/home", { replace: true });
	}, [error, navigate]);

	if (profileLoading) return <p>Connecting...</p>;
	if (isConnecting) return <p>Connecting...</p>;
	if (error) return null;
	if (!room) return <p>My_Error: room unavailable</p>;

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
			title: "Link copied!",
			description: "Share it to invite players.",
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
			<header className="page-header">
				<Logo />
				<LinkProfile
					name={profile?.name ? profile.name : "login"} icon="🥷" />
			</header>
			<main className="flex flex-1 flex-col">
				<div className="h-[7vh] w-screen flex items-center justify-center bg-banner-bg">
					<p className="text-sm">
						{missingPlayers > 0
							? `waiting for ${missingPlayers} more player${missingPlayers > 1 ? "s" : ""} ...`
							: "room is full"}
					</p>
				</div>
				<div>
					<div className="w-screen flex flex-col items-center gap-3 py-6">
						<button
							onClick={() => void handleCopy()}
							className="clean-btn hoverable rounded-lg bg-linear-to-r from-btn-gradient-start to-btn-gradient-end px-4 py-2 text-sm text-white whitespace-nowrap sm:px-6 sm:py-3 sm:text-base"
						>
							Copy the game link
						</button>
						<p>add players from your friend list or send them the link </p>
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
						Start the game
					</button>
				</div>}
			</main>
		</div>
	);
}
