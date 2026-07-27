import { Link } from "react-router-dom";

export type RoomCardProps = {
	id: number;
	name: string;
	players: number;
};

function RoomCard({id, name, players}: RoomCardProps) {
	return (
		<Link to={`/game/${id}`} className="card border-l-2 border-card-accent-border">
					<h3 className="truncate text-outline text-left ">{name}</h3>
					<h3 className="room-name">{name}</h3>

				<div className="room-row">
					<span className="icon">🥷</span>
					<p className="room-mode">undercover</p>
					<span className="room-count">{players}/10</span>
				</div>
		</Link>
	);
}

export default RoomCard;
