import { useEffect,useState  } from "react";
import {getPlayers} from "@/api/player"
import { toast } from "@/components/ui/toast";
import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";
import {getAvatarUrl} from "@/api/player";

type PlayerListPros = {
	id: number;
	name: string;
	createdAt: string;
	avatarUrl: string | null;
	isLog:		boolean;
};

function PlayerList() {
	const [players, setPlayers] = useState<PlayerListPros[]>([]);
	useEffect(() => {
	getPlayers()
		.then((data) => setPlayers(data))
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
				<div className="font-bold"> Users </div>
			</div>
			<div className="flex flex-col max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{players.map((player) => (
					<div className="card flex-row justify-between items-center border border-card-border-2" key={player.id}>
						<div className="flex flex-1 min-w-0 text-left gap-3 items-center">
							<div className="w-10 h-10 rounded-full overflow-hidden bg-card-border-2 flex items-center justify-center">
								{player.avatarUrl ? (
									<img className="w-full h-full rounded-full object-cover"
										src={getAvatarUrl(player.avatarUrl)}
										alt={player.name}
									/>
								) : (
									<span className="mask-icon w-6 h-6 bg-text-dim"
										style={{
											WebkitMaskImage: `url(${AvatarDefault})`,
											maskImage: `url("${AvatarDefault}")`,
										}}
									/>
								)}
							</div>

							<div className="flex flex-1 gap-2 min-w-0 justify-between items-center">

								<div className="flex-col min-w-0">
									<div className="flex items-end gap-3">
										<div className="font-semibold truncate">{player.name}</div>
									</div>
									<span className=" hidden md:block md:text-sm md:text-text-dim">
										profile create at : {new Date(player.createdAt).toLocaleDateString()}
									</span>
								</div>

								<div className={`font-semibold text-xs md:text-sm ${player.isLog ? "text-victory" : "text-text-dim"}`}>
									{player.isLog ? "connected" : "disconnect"}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);

}
export default PlayerList;
