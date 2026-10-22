import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isBannedFromRoom } from "@/api/rooms";
import { toast } from "@/components/ui/toast";

export type RoomCardProps = {
    colyseusRoomId: string;
    name: string;
    playerCount: number;
    maxClients: number;
};

function RoomCard({ colyseusRoomId, name, playerCount, maxClients }: RoomCardProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const path = `/game/${colyseusRoomId}`;

    const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const banned = await isBannedFromRoom(colyseusRoomId).catch(() => false);
        if (banned) {
            toast.add({ type: "error", title: t("lobby.joinError"), description: t("game.banned") });
            return;
        }
        void navigate(path);
    };

    return (
        <Link to={path} onClick={(e) => void handleClick(e)} className="card border-l-2 border-card-accent-border card-neon">
            <h3 className="truncate text-outline text-left font-bold">{name}</h3>

            <div className="flex items-center gap-1">
                <span>🥷</span>
                <p className="text-text-dim">undercover</p>
                <span className="text-text-dim text-sm ml-auto">{playerCount}/{maxClients}</span>
            </div>
        </Link>
    );
}

export default RoomCard;
