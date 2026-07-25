import "./GamesList.css";
import { useState } from "react";
import gamesIcon from "../../../../assets/icons/users-group 1.svg"
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

function timeAgo(dateString: string): string {
	const now = new Date();
	const past = new Date(dateString);
	const diffMs = now.getTime() - past.getTime();

	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMinutes < 1) return "à l'instant";
	if (diffMinutes < 60) return `${diffMinutes}min ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	return `${diffDays}j ago`;
}

function GamesList({games}: RecentGamesListProps) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const topThree = games.slice(0, 3);
	return (
		<div className="games-card">
			<div className="game-header">
				<div className="game-title"> Recent games </div>
				<button
					className="btn-view-games"
					aria-label="View all games"
					onClick={() => setIsPopupOpen(true)}
				>
					View all
				</button>
			</div>
			<div className="game-list">
				{topThree.map((g) => (
					<div className="one-game-card" key={g.id}>
						<div className="game-info-wrap">
							<div className="game-icon-card">
								<span className="game-icon"
										style={{
											WebkitMaskImage: `url("${gamesIcon}")`,
											maskImage: `url("${gamesIcon}")`,
										}}
								/>
							</div>
							<div className="game-name-nbPlayers">
								<div className="game-name-date-wrap">
									<div className="game-name">{g.name}</div>
									<div className="game-time">{timeAgo(g.date)}</div>
								</div>
								<span className="game-nbPlayers">{g.nbPlayers}</span>
							</div>

						</div>
						<div className={`game-status ${g.victory ? "victory" : "defeat"}`}>
							{g.victory ? "Victory" : "Defeat"}
						</div>
					</div>
				))}
			</div>
		</div>
	);

}
export default GamesList;
