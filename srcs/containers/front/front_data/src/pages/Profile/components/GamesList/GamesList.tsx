import gamesIcon from "../../../../assets/icons/users-group 1.svg"
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

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

function timeAgo(dateString: string, t: TFunction): string {
	const now = new Date();
	const past = new Date(dateString);
	const diffMs = now.getTime() - past.getTime();

	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMinutes < 1) return t("profile.justNow");
	if (diffMinutes < 60) return t("profile.minutesAgo", { count: diffMinutes });
	if (diffHours < 24) return t("profile.hoursAgo", { count: diffHours });
	return t("profile.daysAgo", { count: diffDays });
}

function GamesList({games}: RecentGamesListProps) {
	const { t } = useTranslation();

	return (
		<div className="card w-full bg-transparent border border-card-border-2 ">
			<div className="flex justify-between mb-3">
				<div className="font-bold"> {t("profile.recentGames")} </div>
			</div>
			<div className="flex flex-col max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{games.map((g) => (
					<div className="card flex-row justify-between items-center border border-card-border-2" key={g.id}>
						<div className="flex flex-1 min-w-0 text-left gap-3 items-center">
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
									<span className="text-xs text-text-dim">{timeAgo(g.date, t)}</span>
								</div>


								<div className={`font-black text-xs md:text-sm ${g.victory ? "text-victory" : "text-defeat"}`}>
									{g.victory ? t("profile.victory") : t("profile.defeat")}
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
