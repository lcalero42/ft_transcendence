import "./GamesList.css";
import { useState } from "react";
type RecentGamesProps = {
	id: number;
	name: string;
	nbPlayers: number;
	date: string;
	victory: boolean;
};

type RecentGamesListProps = {
	games: RecentGamesProps[];
};

function GamesList({games}: RecentGamesListProps) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const topThree = games.slice(0, 3);
	return (
		<div className="games-cards">
			<div className="game-header">
				<div className="game-title-wrap">
					<div className="game-title"> My games </div>
					<span className="game-count"> ({games.length})  </span>
				</div>
				<button
					className="btn-view-games"
					aria-label="View all games"
					onClick={() => setIsPopupOpen(true)}
				>
					View all
				</button>
			</div>
			<div className="game-list">
				{topThree.map((f) => (
					<div className="game-params" key={f.id}>
						<div className="game-icon"> {f.icon} </div>
						<div className="game-name-status-wrap">
							<div className="game-name">{f.name}</div>
							<div className={`game-status ${f.isOnLine ? "online" : "offline"}`}>
								{f.isOnLine ? "Online" : "Offline"}
						</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);

}
export default GamesList;
