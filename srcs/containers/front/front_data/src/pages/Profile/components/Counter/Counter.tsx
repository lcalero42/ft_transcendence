import winRate from  "../../../../assets/icons/winrate.svg";
import friend from  "../../../../assets/icons/friend-svgrepo-com.svg";
import win from  "../../../../assets/icons/victory-svgrepo-com.svg";
import game from  "../../../../assets/icons/game.svg";
import { useTranslation } from "react-i18next";

type DisplayCounterCardProps = {
	color:		string;
	nb:			string;
	categories:	string;
	icon:		string;
};

type CounterProps = {
	games: number;
	victories: number;
	winrate: number;
	friends: number;
};

function DisplayCounterCard({color, nb, categories, icon} : DisplayCounterCardProps) {
	return (
		<div className="card bg-transparent px-0 py-0 w-36 md:flex-1 md:w-full h-30 border md:border-transparent
		justify-center items-center bg-card border-card-border-2 md:hoverable md:hover:bg-card  md:hover:border-card-border-2
		md:mb-0">
			<div className={` text-4xl font-semibold ${color}`}>{nb}</div>
			<div className="text-sm text-text-dim"> {categories} </div>
			<div className="mask-icon w-6 h-6 bg-text-dim"
				style={{
					WebkitMaskImage: `url("${icon}")`,
					maskImage: `url("${icon}")`,
				}}
			/>
		</div>
	);
}

function Counter({games, victories, winrate, friends} : CounterProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-wrap justify-between md:py-2.5">
			<DisplayCounterCard
				color="text-games"
				nb={games.toString()}
				categories={t("profile.gamesPlayed")}
				icon={game}
			/>
			<DisplayCounterCard
				color="text-victory"
				nb={victories.toString()}
				categories={t("profile.victories")}
				icon={win}
			/>
			<DisplayCounterCard
				color="text-winrate"
				nb={winrate.toString() + "%"}
				categories={t("profile.winRate")}
				icon={winRate}
			/>
			<DisplayCounterCard
				color="text-friends"
				nb={friends.toString()}
				categories={t("profile.friends")}
				icon={friend}
			/>
		</div>
	);
}

export default Counter;
