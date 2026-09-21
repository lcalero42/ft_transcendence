import { useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useRoom, useRoomState } from "@colyseus/react";
import type { SeatReservation } from "@colyseus/sdk";
import type { UndercoverRoom } from "@back/colyseus/rooms/UndercoverRoom";
import type { UndercoverState } from "@back/colyseus/rooms/UndercoverState";
import { client } from "@/lib/colyseusClient";
import {
	clearReconnection,
	readStoredReconnection,
	storeReconnection,
} from "@/lib/roomReconnection";
import { useAuth } from "@/context/useAuth";
import GameView from "@/components/colyseus/GameView";

function GameRoom() {
	const { id } = useParams();
	const { profile, profileLoading } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	// Frozen at mount: the effect below strips the reservation from history.state,
	// and useRoom compares deps by identity — an unfrozen reservation would tear
	// down the room and rejoin.
	const reservationRef = useRef(
		(location.state as { reservation?: SeatReservation } | null)?.reservation,
	);

	const { room, error, isConnecting } = useRoom<UndercoverRoom>(
		profileLoading || !id
			? null
			: async () => {
					const reservation = reservationRef.current;
					if (reservation) {
						try {
							return await client.consumeSeatReservation<UndercoverState>(reservation);
						} catch {
							// Spent reservation: we got here by reloading the page, not by the
							// lobby handoff. history.state survives a reload, the seat does not.
						}
					}

					const stored = readStoredReconnection();
					if (stored && stored.roomId === id) {
						try {
							return await client.reconnect<UndercoverRoom>(stored.token);
						} catch {
							clearReconnection();
						}
					}

					return client.joinById<UndercoverRoom>(id, {
						name: profile?.name,
						avatarUrl: profile?.avatarUrl,
					});
				},
		[id, profileLoading],
	);

	useEffect(() => {
		if (!room) return;
		storeReconnection(room);
		// Drop the now-spent reservation so a reload reconnects instead of replaying it.
		if (location.state) {
			void navigate(location.pathname, { replace: true, state: null });
		}
	}, [room, location.state, location.pathname, navigate]);

	// The server issues a new reconnection token on every join, and the SDK's
	// automatic retry rewrites it on the same room object, so re-store it.
	useEffect(() => {
		if (!room) return;
		const onReconnect = () => storeReconnection(room);
		room.onReconnect(onReconnect);
		return () => room.onReconnect.remove(onReconnect);
	}, [room]);

	// The room is still in its lobby phase: the link was shared before the host
	// started it. Send the player to the lobby, which owns the "setup" phase.
	const phase = useRoomState(room, (s) => s.phase);
	useEffect(() => {
		if (!room || phase !== "setup") return;
		void navigate(`/create-room/${room.roomId}`, { replace: true });
	}, [room, phase, navigate]);

	if (!id) return <p>My_Error: no room id provided</p>;
	if (profileLoading) return <p>Connecting...</p>;
	if (isConnecting) return <p>Connecting...</p>;
	if (error) return <p>My_Error: {error.message}</p>;
	if (!room) return <p>My_Error: room unavailable</p>;

	return <GameView room={room} />;
}

export default GameRoom;
