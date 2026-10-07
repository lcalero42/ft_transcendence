import { countPlayer } from '@/api/player';
import { countRoomActives } from '@/api/rooms';
import { countGames } from '@/api/games';
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

type DisplayCountCardProps = {
	color:		string;
	nb:			string;
	categories:	string;
};

function DisplayCountCard({color, nb, categories} : DisplayCountCardProps) {
	return (
		<div className="card flex-row md:flex-col md:bg-transparent md:flex-1 w-full border md:border-transparent
		bg-card border-card-border-2 md:hoverable md:hover:bg-card  md:hover:border-card-border-2
		md:mb-0 text-l font-semibold gap-12 md:gap-3 items-center">
			<p className={`font-black text-2xl ${color}`}>{nb}</p>
			<p className=" text-left flex-1"> {categories} </p>
		</div>
	);
}

function CountCards() {
	const { t } = useTranslation();
	const [playerCount, setPlayerCount] = useState<number | null>(null);
	const [roomCount, setRoomCount] = useState<number | null>(null);
	const [gameCount, setGameCount] = useState<number | null>(null);

	useEffect(() => {
		countPlayer()
			.then((count) => setPlayerCount(count))
			.catch((err: unknown) => toast.add({
				title: i18n.t("common.errorOccurred"),
				description: err instanceof Error ? err.message : i18n.t("common.somethingWentWrong"),
			}));
		countRoomActives()
			.then((count) => setRoomCount(count))
			.catch((err: unknown) => toast.add({
				title: i18n.t("common.errorOccurred"),
				description: err instanceof Error ? err.message : i18n.t("common.somethingWentWrong"),
			}));
		countGames()
			.then((count) => setGameCount(count))
			.catch((err: unknown) => toast.add({
				title: i18n.t("common.errorOccurred"),
				description: err instanceof Error ? err.message : i18n.t("common.somethingWentWrong"),
			}));

	}, []);

	return (
		<div className="flex flex-wrap justify-between md:py-2.5">
			<DisplayCountCard
				color="text-winrate"
				nb={playerCount !== null ? playerCount.toString() : "..."}
				categories={t("admin.users")}
			/>
			<DisplayCountCard
				color="text-victory"
				nb={gameCount !== null ? gameCount.toString() : "..."}
				categories={t("admin.gamesFinished")}
			/>
			<DisplayCountCard
				color="text-friends"
				nb={roomCount !== null ? roomCount.toString() : "..."}
				categories={t("admin.activeRooms")}
			/>

		</div>
	);
}

export default CountCards;
