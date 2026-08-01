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
	const [, setIsPopupOpen] = useState(false);
	const topThree = games.slice(0, 3);
	return (
		<div className="card w-full  border border-card-border-2 ">
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
			<div className="flex flex-col">
				{topThree.map((g) => (
					<div className="card px-2 gap-5 flex-row justify-between items-center border border-card-border-2" key={g.id}>
						<div className="flex flex-1 min-w-0 text-left gap-3">
							<div className="circle-purple w-9 h-9 rounded-xl">
								<span className="mask-icon w-7 h-7 bg-accent-purple"
										style={{
											WebkitMaskImage: `url("${gamesIcon}")`,
											maskImage: `url("${gamesIcon}")`,
										}}
								/>
							</div>

							<div className="flex flex-1 gap-2 min-w-0 justify-between items-center">

								<div className="flex-col min-w-0">
									<div className="flex items-end gap-3">
										<div className="font-semibold truncate">{g.name}</div>
										<span className="circle-purple text-sm w-5 h-5">{g.nbPlayers}</span>
									</div>
									<span className="text-xs text-text-dim">{timeAgo(g.date)}</span>
								</div>


								<div className={`font-black text-xs ${g.victory ? "text-victory" : "text-defeat"}`}>
									{g.victory ? "Victory" : "Defeat"}
								</div>
						</div>
							</div>
					</div>
				))}
			</div>
		</div>
	);

}
export default GamesList;
