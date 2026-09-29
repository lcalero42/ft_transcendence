import { useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useRoom, useRoomState } from "@colyseus/react";
import type { SeatReservation } from "@colyseus/sdk";
import type { UndercoverRoom } from "@back/colyseus/rooms/UndercoverRoom";
import type { UndercoverState } from "@back/colyseus/rooms/UndercoverState";
import { client } from "@/lib/colyseusClient";
import { getToken } from "@/api/auth/client";
import GameView from "@/pages/GameRoom/components/GameView";
import LoadPage from "@/components/LoadPage/LoadPage";
import ErrorPage from "@/components/ErrorPage/ErrorPage";
import {
	clearReconnection,
	readStoredReconnection,
	storeReconnection,
} from "@/lib/roomReconnection";
import { useAuth } from "@/context/useAuth";
import { useSeatTakenOver } from "@/lib/useSeatTakenOver";

function GameRoom() {
	const { id } = useParams();
	const { profile, profileLoading } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

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

					client.auth.token = getToken() ?? "";
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

		if (location.state) {
			void navigate(location.pathname, { replace: true, state: null });
		}
	}, [room, location.state, location.pathname, navigate]);

	useEffect(() => {
		if (!room) return;
		const onReconnect = () => storeReconnection(room);
		room.onReconnect(onReconnect);
		return () => room.onReconnect.remove(onReconnect);
	}, [room]);

	useSeatTakenOver(room);

	const phase = useRoomState(room, (s) => s.phase);
	useEffect(() => {
		if (!room || phase !== "setup") return;
		void navigate(`/create-room/${room.roomId}`, { replace: true });
	}, [room, phase, navigate]);

	if (!id) return <ErrorPage error="No room id provided" />;
	if (profileLoading) return <LoadPage text="Connecting" />;
	if (isConnecting) return <LoadPage text="Connecting" />;
	if (error) return <ErrorPage error={error.message} />;
	if (!room) return <ErrorPage error="room unavailable" />;

	return <GameView room={room} />;
}

export default GameRoom;
