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
		<div className="card mb-5 border border-card-border-2">
			<div className="flex justify-between">
				<div className="font-bold"> Recent games </div>
				<button
					className="clean-btn font-medium text-accent hoverable hover:font-black"
					aria-label="View all games"
					onClick={() => setIsPopupOpen(true)}
				>
					View all
				</button>
			</div>
			<div className="flex flex-col gap-3">
				{topThree.map((g) => (
					<div className="card flex-row justify-between items-center border border-card-border-2" key={g.id}>
						<div className="flex text-left gap-3">
							<div className="circle-purple  w-10.5 h-10.5 rounded-xl">
								<span className="mask-icon w-8 h-8 bg-accent-purple"
										style={{
											WebkitMaskImage: `url("${gamesIcon}")`,
											maskImage: `url("${gamesIcon}")`,
										}}
								/>
							</div>
							<div className="flex gap-3">
								<div>
									<div className="font-semibold truncate">{g.name}</div>
									<div className="text-xs text-text-dim">{timeAgo(g.date)}</div>
								</div>
								<span className="circle-purple text-xs w-4.5 h-4.5">{g.nbPlayers}</span>
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
