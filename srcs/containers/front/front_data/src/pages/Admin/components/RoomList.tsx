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

						<span className="text-xs md:text-sm font-semibold hoverable hover:text-accent-purple">{player.name}</span>
					</div>
					<span
						className={`text-xs md:text-sm ${
							player.role === "undercover" ? "text-undercover" : "text-civilian"
						}`}
					>
						{player.role === "undercover" ? wUnderCover : wCivil}

					</span>
				</div>
			))}
		</div>
	);
}

function RoomItem({room}: {room: Room}) {
	const { t } = useTranslation();
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [openGameId, setOpenGameId] = useState<number | null>(null);

	useEffect(() => {
	getGamesByRoom(room.id)
		.then((data) => setGames(data))
		.catch((err: unknown) =>
			toast.add({
				title: i18n.t("common.errorOccurred"),
				description: err instanceof Error ? err.message : i18n.t("common.somethingWentWrong"),
			})
		)
		.finally(() =>setLoading(false));
	}, [room.id]);

	return (
		<div className="flex flex-col rounded-xl bg-card border-l-4 border-accent px-3 py-3 md:px-4">
			<div className="flex justify-between items-center pb-2 border-b border-card-border-2">
				<div className="font-semibold text-base md:text-lg truncate">{room.name}</div>
				<span className="text-xs md:text-sm text-text-dim shrink-0">
					{!loading && <>{t("admin.gamesCount", { count: games.length })} · </>}
					<p className="hidden md:inline">{t("admin.createdAt")} </p>
					{new Date(room.createdAt).toLocaleDateString(i18n.language)}
				</span>
			</div>
			{loading ? (
				<div className="text-xs text-text-dim px-2 py-2">{t("admin.loadingGames")}</div>
			) : (
			<div className="flex flex-col divide-y divide-card-border-2">
			{games.map((game) => (
				<div key={game.id}>
					<button
						className="w-full flex justify-between items-center px-2 py-2 my-1 rounded-lg cursor-pointer hoverable hover:bg-white/5 group"
						onClick={() =>
							setOpenGameId((prev) => (prev === game.id ? null : game.id))
						}
					>
						<div className="flex items-center md:gap-2 font-semibold hoverable group-hover:text-accent-purple text-xs md:text-sm">
							<span className={`w-2 h-2 mr-2 md:mr-0 rounded-full shrink-0 ${game.victory === "undercover" ? "bg-undercover" : "bg-civilian"}`} />
							<p className="hidden md:inline">{t("admin.gameOf")}</p>
							<p>{new Date(game.createdAt).toLocaleDateString(i18n.language)}</p>
						</div>
						<div className={`font-semibold text-xs md:text-sm ${game.victory === "undercover" ? "text-undercover" : "text-civilian"}`}>
						 	<p className="md:text-text-dim inline"> {t("admin.victory")} </p>
							<p className="hidden text-text-dim md:inline"> : </p>
							<p className="hidden md:inline"> {game.victory ? t(`roles.${game.victory}`) : ""} </p>
						 </div>
						<span className="flex items-center gap-1 text-xs md:text-sm hoverable text-accent group-hover:text-accent-purple">
							{openGameId === game.id ? t("admin.hide") : t("admin.view")}
							<span className={`inline-block transition-transform duration-200 ease-in-out ${openGameId === game.id ? "rotate-90 translate-x-1 group-hover:translate-y-0.5" : "group-hover:translate-x-1"}`}>›</span>
						</span>
					</button>
					{openGameId === game.id && <PlayerList gameId={game.id} wUnderCover={game.undercoverWord} wCivil={game.civilianWord}/>}
				</div>
			))}
			{games.length === 0 && (
				<div className="text-xs text-text-dim px-2 py-2">{t("admin.noGames")}</div>
			)}
			</div>
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
		<div className="card w-full bg-transparent border border-card-border-2 ">
			<div className="flex justify-between">
				<div className="font-bold text-xl"> {t("admin.rooms")} </div>
			</div>
			<div className="flex flex-col gap-4 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{rooms.map((room) => (
					<RoomItem room={room} key={room.id} />
				))}
			</div>
		</div>
	);

}
export default RoomList;
