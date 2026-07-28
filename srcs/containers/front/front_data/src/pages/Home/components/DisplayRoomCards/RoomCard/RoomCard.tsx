import { Link } from "react-router-dom";

export type RoomCardProps = {
	id: number;
	name: string;
	players: number;
};

function RoomCard({id, name, players}: RoomCardProps) {
	return (
		<Link to={`/game/${id}`} className="card border-l-2 border-card-accent-border">
					<h3 className="truncate text-outline text-left font-bold">{name}</h3>

				<div className="flex items-center gap-1">
					<span>🥷</span>
					<p className="text-text-dim">undercover</p>
					<span className="text-text-dim text-sm ml-auto">{players}/10</span>
				</div>
		</Link>
	);
}

export default RoomCard;
