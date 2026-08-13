import { countPlayer } from '@/api/player';
import { countRoomActives } from '@/api/rooms';
import { countGames } from '@/api/games';
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/toast";

type DisplayCountCardProps = {
	color:		string;
	nb:			string;
	categories:	string;
};

function DisplayCountCard({color, nb, categories} : DisplayCountCardProps) {
	return (
		<div className="card flex-row md:flex-col md:bg-transparent md:flex-1 w-full border md:border-transparent
		bg-card border-card-border-2 md:hoverable md:hover:bg-card  md:hover:border-card-border-2
		md:mb-0 text-xl font-semibold gap-12 md:gap-3 items-center">
			<p className={`font-black text-2xl ${color}`}>{nb}</p>
			<p className=" text-left flex-1"> {categories} </p>
		</div>
	);
}

function CountCards() {
	const [playerCount, setPlayerCount] = useState<number | null>(null);
	const [roomCount, setRoomCount] = useState<number | null>(null);
	const [gameCount, setGameCount] = useState<number | null>(null);

	useEffect(() => {
		countPlayer()
			.then((count) => setPlayerCount(count))
			.catch((err) => toast.add({
				title: "An error occured",
				description: err.message,
			}));
		countRoomActives()
			.then((count) => setRoomCount(count))
			.catch((err) => toast.add({
				title: "An error occured",
				description: err.message,
			}));
		countGames()
			.then((count) => setGameCount(count))
			.catch((err) => toast.add({
				title: "An error occured",
				description: err.message,
			}));

	}, []);

	return (
		<div className="flex flex-wrap justify-between md:py-2.5">
			<DisplayCountCard
				color="text-winrate"
				nb={playerCount !== null ? playerCount.toString() : "..."}
				categories="Users"
			/>
			<DisplayCountCard
				color="text-victory"
				nb={gameCount !== null ? gameCount.toString() : "..."}
				categories="Games finish"
			/>
			<DisplayCountCard
				color="text-friends"
				nb={roomCount !== null ? roomCount.toString() : "..."}
				categories="Rooms actives"
			/>

		</div>
	);
}

export default CountCards;
