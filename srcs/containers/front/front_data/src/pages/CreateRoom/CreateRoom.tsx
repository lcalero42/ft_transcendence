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

	if (profileLoading) return <p>Connecting...</p>;
	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>My_Error: {error.message}</p>;
	if (!room) return <p>My_Error: room unavailable</p>;

	const inviteLink = `${window.location.origin}/create-room/${room.roomId}`;
	const playerEntries = Object.entries(players ?? {});
	const isHost = room.sessionId === hostSessionId;

	const handleCopy = async () => {
		await navigator.clipboard.writeText(inviteLink);
		toast.add({
			type: "success",
			title: "Lien copié !",
			description: "Partage-le pour inviter des joueurs.",
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
			<main>
				<div className="h-[7vh] w-screen flex items-center justify-center bg-banner-bg">
					<p className="text-sm">
						en attente de 2 joueurs supplementaire ...
					</p>
				</div>
				<div>
					<div className="w-screen flex flex-col items-center gap-3 py-6">
						<button
							onClick={() => void handleCopy()}
							className="clean-btn hoverable rounded-lg bg-linear-to-r from-btn-gradient-start to-btn-gradient-end px-4 py-2 text-sm text-white whitespace-nowrap sm:px-6 sm:py-3 sm:text-base"
						>
							Copier le lien de la Partie
						</button>
						<p>ajoutez des joueurs depuis votre liste d'amis ou envoyez leur le lien </p>
					</div>
					<div className="px-[10vw] py-5 md:flex">
						<div className="w-full md:flex md:flex-1 md:justify-center">
							<FriendList friends={friends} />
						</div>
						<div className="w-full md:flex md:flex-1 md:justify-center">
							<FriendList friends={friends} />
						</div>
					</div>

				</div>
				<input readOnly value={inviteLink} onFocus={(e) => e.target.select()} />


				<h2>Joueurs ({playerEntries.length})</h2>
				<ul>
					{playerEntries.map(([sessionId, player]) => (
						<li key={sessionId} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
							<img
								src={resolveAvatar(player.avatarUrl)}
								alt={player.name}
								style={{ width: "2rem", height: "2rem", borderRadius: "9999px", objectFit: "cover" }}
							/>
							{player.name}
							{sessionId === room.sessionId ? " (toi)" : ""}
						</li>
					))}
				</ul>

				{isHost && <button onClick={handleStart}>Lancer la partie</button>}
			</main>
		</div>
	);
}
