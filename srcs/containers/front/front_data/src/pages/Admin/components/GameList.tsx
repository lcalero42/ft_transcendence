import { useEffect,useState  } from "react";
import { toast } from "@/components/ui/toast";
import { getGames } from "@/api/games";

type GameListPros = {
	id: number;
	name: string;
	createdAt: string;
	nbPlayer: number | null;
};

function GameList() {
	const [games, setgames] = useState<GameListPros[]>([]);
	useEffect(() => {
	getGames()
		.then((data) => setgames(data))
		.catch((err) =>
			toast.add({
				title: "An error occured",
				description: err.message,
			})
		);
}, []);
	return (
		<div className="card w-full md:bg-transparent border border-card-border-2 ">
			<div className="flex justify-between mb-3">
				<div className="font-bold text-xl"> Games </div>
			</div>
			<div className="flex flex-col max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{games.map((game) => (
					<div className="card flex-row justify-between items-center border border-card-border-2" key={game.id}>
						<div className="flex flex-1 min-w-0 text-left gap-3 items-center">
							{/* <div className="w-10 h-10 rounded-full overflow-hidden bg-card-border-2 flex items-center justify-center"> */}
{/*  */}
							{/* </div> */}

							<div className="flex flex-1 gap-2 min-w-0 justify-between items-center">

								<div className="flex-col min-w-0">
									<div className="flex items-end gap-3">
										<div className="font-semibold truncate">{game.name}</div>
									</div>
									<span className=" hidden md:block md:text-sm md:text-text-dim">
										profile create at : {new Date(game.createdAt).toLocaleDateString()}
									</span>
								</div>
								<div className="flex items-center">
									{game.nbPlayer ? (
										<p>{game.nbPlayer} players</p>
									) : (
										<p>0 players</p>
									)}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);

}
export default GameList;
