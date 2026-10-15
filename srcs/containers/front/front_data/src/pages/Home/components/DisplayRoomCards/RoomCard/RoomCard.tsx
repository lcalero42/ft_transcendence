import { Link } from "react-router-dom";

export type RoomCardProps = {
    colyseusRoomId: string;
    name: string;
    playerCount: number;
    maxClients: number;
};

function RoomCard({ colyseusRoomId, name, playerCount, maxClients }: RoomCardProps) {
    return (
        <Link to={`/game/${colyseusRoomId}`} className="card border-l-2 border-card-accent-border">
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
