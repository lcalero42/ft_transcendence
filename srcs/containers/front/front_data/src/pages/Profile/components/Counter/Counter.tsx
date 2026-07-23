import "./Counter.css";
import winRate from  "../../../../assets/icons/winrate.svg";
import friend from  "../../../../assets/icons/friend-svgrepo-com.svg";
import win from  "../../../../assets/icons/victory-svgrepo-com.svg";
import game from  "../../../../assets/icons/game.svg";

type DisplayCounterCardProps = {
	style:		string;
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

function DisplayCounterCard({style, nb, categories, icon} : DisplayCounterCardProps) {
	return (
		<div className="counter-card">
			<div className={style}>{nb}</div>
			<div className="counter-subtitle"> {categories} </div>
			<div className="counter-icon"
				style={{
					WebkitMaskImage: `url("${icon}")`,
					maskImage: `url("${icon}")`,
				}}
			/>
		</div>
	);
}

function Counter({games, victories, winrate, friends} : CounterProps) {
	return (
		<div className="counter">
			<DisplayCounterCard
				style="games"
				nb={games.toString()}
				categories="Games played"
				icon={game}
			/>
			<DisplayCounterCard
				style="victories"
				nb={victories.toString()}
				categories="Victories"
				icon={win}
			/>
			<DisplayCounterCard
				style="win-rate"
				nb={winrate.toString() + "%"}
				categories="Win rate"
				icon={winRate}
			/>
			<DisplayCounterCard
				style="friends"
				nb={friends.toString()}
				categories="Friends"
				icon={friend}
			/>
		</div>
	);
}

export default Counter;
