import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Room } from "@colyseus/sdk";
import { toast } from "@/components/ui/toast";
import { clearReconnection } from "./roomReconnection";

const FORCED_LEAVE_MESSAGES: Record<number, string> = {
	4100: "game.seatTakenOver",
	4101: "game.kicked",
	4102: "game.banned",
};

export function isBannedError(error: Error) {
	return (error as { code?: number }).code === 4102;
}

export function joinErrorMessage(error: Error, t: (key: string) => string) {
	return isBannedError(error) ? t(FORCED_LEAVE_MESSAGES[4102]) : error.message;
}

export function useSeatTakenOver<T>(room: Room<T> | null | undefined) {
	const navigate = useNavigate();
	const { t } = useTranslation();

	useEffect(() => {
		if (!room) return;
		const onLeave = (code: number) => {
			const message = FORCED_LEAVE_MESSAGES[code];
			if (!message) return;
			clearReconnection();
			toast.add({ id: "forced-leave", type: "warning", title: t(message) });
			void navigate("/home", { replace: true });
		};
		room.onLeave(onLeave);
		return () => room.onLeave.remove(onLeave);
	}, [room, navigate, t]);
}
