import { useEffect,useState  } from "react";
import { toast } from "@/components/ui/toast";
import { getGamesByRoom, fetchRooms, type Room } from "@/api/rooms";
import { getPlayersByGame } from "@/api/games";
import { getAvatarUrl } from "@/api/player";
import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";
import LoadPage from "@/components/LoadPage/LoadPage";
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
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getPlayersByGame(gameId)
			.then((data) => setPlayers(data))
			.catch((err: unknown) =>
				toast.add({
					title: "An error occured",
					description: err instanceof Error ? err.message : "Something went wrong.",
				})
			)
			.finally(() => setLoading(false));
	}, [gameId]);

    if (loading) return <LoadPage />;
	if (players.length === 0) {
		return <div className="text-xs text-text-dim px-3 py-2">No players in this game</div>;}
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
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [openGameId, setOpenGameId] = useState<number | null>(null);

	useEffect(() => {
	getGamesByRoom(roomId)
		.then((data) => setGames(data))
		.catch((err: unknown) =>
			toast.add({
				title: "An error occured",
				description: err instanceof Error ? err.message : "Something went wrong.",
			})
		)
		.finally(() =>setLoading(false));
	}, [roomId]);

	if (loading) return <div className="text-xs text-text-dim px-3 py-2">Loading games...</div>;

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
							<p className="hidden md:inline">game of</p>
							<p>{new Date(game.createdAt).toLocaleDateString()}</p>
						</div>
						<div className={`font-semibold text-xs md:text-base ${game.victory === "undercover" ? "text-orange-400" : "text-blue-400"}`}>
						 	<p className="md:text-text-dim inline"> victory </p>
							<p className="hidden text-text-dim md:inline"> : </p>
							<p className="hidden md:inline"> {game.victory} </p>
						 </div>
						<span className="text-sm md:text-base hoverable text-accent hover:font-black">
							{openGameId === game.id ? "Hide" : "View"}
						</span>
					</button>
					{openGameId === game.id && <PlayerList gameId={game.id} wUnderCover={game.undercoverWord} wCivil={game.civilianWord}/>}
				</div>
			))}
			{games.length === 0 && (
				<div className="text-xs text-text-dim">No games played yet</div>
			)}
		</div>
	);
}

function RoomList() {
	const [rooms, setRooms] = useState<Room[]>([]);

	useEffect(() => {
		fetchRooms()
		.then((data) => setRooms(data))
		.catch((err: unknown) =>
			toast.add({
				title: "An error occured:",
				description: err instanceof Error ? err.message : "Something went wrong.",
			})
		);
	}, []);

	return (
		<div className="card w-full md:bg-transparent border border-card-border-2 ">
			<div className="flex justify-between">
				<div className="font-bold text-xl"> Rooms </div>
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
								<p className="hidden md:inline">create at </p>
								{new Date(room.createdAt).toLocaleDateString()}
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
