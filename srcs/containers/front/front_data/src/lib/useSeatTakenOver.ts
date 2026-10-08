import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Room } from "@colyseus/sdk";
import { toast } from "@/components/ui/toast";
import { clearReconnection } from "./roomReconnection";

const SEAT_TAKEN_OVER_CODE = 4100;

export function useSeatTakenOver<T>(room: Room<T> | null | undefined) {
	const navigate = useNavigate();
	const { t } = useTranslation();

	useEffect(() => {
		if (!room) return;
		const onLeave = (code: number) => {
			if (code !== SEAT_TAKEN_OVER_CODE) return;
			clearReconnection();
			toast.add({ id: "seat-taken-over", type: "warning", title: t("game.seatTakenOver") });
			void navigate("/home", { replace: true });
		};
		room.onLeave(onLeave);
		return () => room.onLeave.remove(onLeave);
	}, [room, navigate, t]);
}
