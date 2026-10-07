import { useEffect,useState  } from "react";
import { toast } from "@/components/ui/toast";
import { getGamesByRoom, fetchRooms, type Room } from "@/api/rooms";
import { getPlayersByGame } from "@/api/games";
import { getAvatarUrl } from "@/api/player";
import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";
import LoadPage from "@/components/LoadPage/LoadPage";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
type Game = {
	id: number;
	createdAt: string;
	roomId: number;
	victory: string;
	civilianWord: string;
	undercoverWord: string;
};

type Player = {
	id: number;
	name: string;
	avatarUrl: string | null;
	role: string;
};


function PlayerList({gameId, wUnderCover, wCivil}: {gameId: number, wUnderCover: string, wCivil: string}) {
	const { t } = useTranslation();
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getPlayersByGame(gameId)
			.then((data) => setPlayers(data))
			.catch((err: unknown) =>
				toast.add({
					title: i18n.t("common.errorOccurred"),
					description: err instanceof Error ? err.message : i18n.t("common.somethingWentWrong"),
				})
			)
			.finally(() => setLoading(false));
	}, [gameId]);

    if (loading) return <LoadPage />;
	if (players.length === 0) {
		return <div className="text-xs text-text-dim px-3 py-2">{t("admin.noPlayers")}</div>;}
	return (
		<div className="flex flex-col gap-2 p-3 md:px-5">
			{players.map((player) => (
				<div className="flex items-center justify-between" key={player.id}>
					<div className="flex items-center gap-2 md:gap-4">
						<div className=" w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
							{player.avatarUrl ? (
								<img
									className="w-full h-full rounded-full object-cover"
									src={getAvatarUrl(player.avatarUrl)}
									alt={player.name}
								/>
							) : (
								<span
									className="mask-icon w-6 h-6 bg-text-dim"
									style={{
										WebkitMaskImage: `url(${AvatarDefault})`,
										maskImage: `url("${AvatarDefault}")`,
									}}
								/>
							)}
						</div>

						<span className="text-sm md:text-base font-semibold hoverable hover:font-black">{player.name}</span>
					</div>
					<span
						className={`text-sm md:text-base ${
							player.role === "undercover" ? "text-orange-400" : "text-blue-400"
						}`}
					>
						{player.role === "undercover" ? wUnderCover : wCivil}

					</span>
				</div>
			))}
		</div>
	);
}

function GameList({roomId}: {roomId: number}) {
	const { t } = useTranslation();
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [openGameId, setOpenGameId] = useState<number | null>(null);

	useEffect(() => {
	getGamesByRoom(roomId)
		.then((data) => setGames(data))
		.catch((err: unknown) =>
			toast.add({
				title: i18n.t("common.errorOccurred"),
				description: err instanceof Error ? err.message : i18n.t("common.somethingWentWrong"),
			})
		)
		.finally(() =>setLoading(false));
	}, [roomId]);

	if (loading) return <div className="text-xs text-text-dim px-3 py-2">{t("admin.loadingGames")}</div>;

	return (
		<div className="flex flex-col gap-5 ">
			{games.map((game) => (
				<div key={game.id} className="border border-card-border-2 rounded-4xl">
					<button
						className="w-full flex justify-between items-center p-3 md:py-3 md:px-6 hoverable"
						onClick={() =>
							setOpenGameId((prev) => (prev === game.id ? null : game.id))
						}
					>
						<div className="flex md:gap-2 font-semibold hoverable hover:font-black text-sm md:text-lg">
							<p className="hidden md:inline">{t("admin.gameOf")}</p>
							<p>{new Date(game.createdAt).toLocaleDateString(i18n.language)}</p>
						</div>
						<div className={`font-semibold text-xs md:text-base ${game.victory === "undercover" ? "text-orange-400" : "text-blue-400"}`}>
						 	<p className="md:text-text-dim inline"> {t("admin.victory")} </p>
							<p className="hidden text-text-dim md:inline"> : </p>
							<p className="hidden md:inline"> {game.victory ? t(`roles.${game.victory}`) : ""} </p>
						 </div>
						<span className="text-sm md:text-base hoverable text-accent hover:font-black">
							{openGameId === game.id ? t("admin.hide") : t("admin.view")}
						</span>
					</button>
					{openGameId === game.id && <PlayerList gameId={game.id} wUnderCover={game.undercoverWord} wCivil={game.civilianWord}/>}
				</div>
			))}
			{games.length === 0 && (
				<div className="text-xs text-text-dim">{t("admin.noGames")}</div>
			)}
		</div>
	);
}

function RoomList() {
	const { t } = useTranslation();
	const [rooms, setRooms] = useState<Room[]>([]);

	useEffect(() => {
		fetchRooms()
		.then((data) => setRooms(data))
		.catch((err: unknown) =>
			toast.add({
				title: i18n.t("common.errorOccurred"),
				description: err instanceof Error ? err.message : i18n.t("common.somethingWentWrong"),
			})
		);
	}, []);

	return (
		<div className="card w-full md:bg-transparent border border-card-border-2 ">
			<div className="flex justify-between">
				<div className="font-bold text-xl"> {t("admin.rooms")} </div>
			</div>
			<div className="flex flex-col max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{rooms.map((room) => (
					<div
						className="card border border-card-border-2"
						key={room.id}
					>
						<div className="w-full flex justify-between items-center">
							<div className="font-semibold ">{room.name}</div>
							<span className="text-sm text-text-dim">
								<p className="hidden md:inline">{t("admin.createdAt")} </p>
								{new Date(room.createdAt).toLocaleDateString(i18n.language)}
							</span>
						</div>

						<GameList roomId={room.id} />
					</div>
				))}
			</div>
		</div>
	);

}
export default RoomList;
