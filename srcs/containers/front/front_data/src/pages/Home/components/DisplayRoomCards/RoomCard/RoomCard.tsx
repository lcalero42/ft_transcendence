import "./RoomCard.css";
import { Link } from "react-router-dom";

export type RoomCardProps = {
	id: number;
	name: string;
	players: number;
};

function RoomCard({id, name, players}: RoomCardProps) {
	return (
		<Link to={`/game/${id}`} className="room-card">
				<div className="room-row">
					<h3 className="room-name">{name}</h3>
				</div>

				<div className="room-row">
					<span className="icon">🥷</span>
					<p className="room-mode">undercover</p>
					<span className="small-oval">{players}/10</span>
				</div>
		</Link>
	);
}

export default RoomCard;
