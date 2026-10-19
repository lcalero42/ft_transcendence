import { useEffect,useState  } from "react";
import {getPlayers} from "@/api/player"
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useFriends } from "@/context/useFriends";
import i18n from "@/i18n";
import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";
import {getAvatarUrl} from "@/api/player";

type PlayerListPros = {
	id: number;
	name: string;
	createdAt: string;
	avatarUrl: string | null;
	isGuest:	boolean;
};

type Filter = "all" | "players" | "guests";

function PlayerAvatar({ player }: { player: PlayerListPros }) {
	return (
		<div className={`w-10 h-10 rounded-full overflow-hidden bg-card-border-2 flex items-center justify-center shrink-0 ${
			player.isGuest ? "border border-dashed border-text-dim" : ""}`}>
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
	);
}

function PlayerList() {
	const { t } = useTranslation();
	const [players, setPlayers] = useState<PlayerListPros[]>([]);
	const [filter, setFilter] = useState<Filter>("all");
	const [onlineFirst, setOnlineFirst] = useState(false);
	const { onlineIds } = useFriends();

	const guestCount = players.filter((p) => p.isGuest).length;
	const filters: { key: Filter; label: string; count: number }[] = [
		{ key: "all", label: t("admin.filterAll"), count: players.length },
		{ key: "players", label: t("admin.filterPlayers"), count: players.length - guestCount },
		{ key: "guests", label: t("admin.filterGuests"), count: guestCount },
	];
	const filtered = players.filter((p) =>
		filter === "all" ? true : filter === "guests" ? p.isGuest : !p.isGuest
	);
	const displayed = onlineFirst
		? [...filtered].sort((a, b) => Number(onlineIds.has(b.id)) - Number(onlineIds.has(a.id)))
		: filtered;

	useEffect(() => {
	getPlayers()
		.then((data) => setPlayers(data))
		.catch((err: unknown) =>
			toast.add({
				title: i18n.t("common.errorOccurred"),
				description: err instanceof Error ? err.message : i18n.t("common.somethingWentWrong"),
			})
		);
}, []);
	return (
		<div className="card w-full bg-transparent border border-card-border-2 ">
			<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
				<div className="font-bold text-xl text-left"> {t("admin.users")} </div>
				<div className="flex flex-col md:flex-row gap-2 self-start md:self-auto md:items-center">
					<div className="flex gap-1 p-1 rounded-full border border-card-border-2">
						{filters.map((f) => (
							<button
								key={f.key}
								onClick={() => setFilter(f.key)}
								className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hoverable ${
									filter === f.key ? "bg-accent text-white" : "text-text-dim hover:text-white"}`}
							>
								{f.label} <span className="opacity-70">({f.count})</span>
							</button>
						))}
					</div>
					<button
						onClick={() => setOnlineFirst((prev) => !prev)}
						aria-pressed={onlineFirst}
						className={`self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer hoverable ${
							onlineFirst
								? "bg-victory/10 border-victory/40 text-victory"
								: "border-card-border-2 text-text-dim hover:text-white"}`}
					>
						<span className={`w-2 h-2 rounded-full ${onlineFirst ? "bg-victory" : "bg-text-dim"}`} />
						{t("admin.onlineFirst")}
					</button>
				</div>
			</div>
			<div className="flex flex-col max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{displayed.map((player) => (
					<div className="card flex-row justify-between items-center border border-card-border-2" key={player.id}>
						<div className="flex flex-1 min-w-0 text-left gap-3 items-center">
							{player.isGuest ? (
								<PlayerAvatar player={player} />
							) : (
								<Link
									to={`/profile/${encodeURIComponent(player.name)}`}
									target="_blank"
									rel="noopener noreferrer"
									title={t("game.profile")}
									className="shrink-0 rounded-full transition-shadow duration-200 hover:ring-2 hover:ring-accent"
								>
									<PlayerAvatar player={player} />
								</Link>
							)}

							<div className="flex flex-1 gap-2 min-w-0 justify-between items-center">

								<div className="flex-col min-w-0">
									<div className="flex items-center gap-2">
										<div className={`font-semibold truncate ${player.isGuest ? "text-text-dim" : ""}`}>{player.name}</div>
										{player.isGuest && (
											<span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-text-dim/15 text-text-dim">
												{t("admin.guestBadge")}
											</span>
										)}
									</div>
									<span className=" hidden md:block md:text-sm md:text-text-dim">
										{t("admin.profileCreatedAt")} {new Date(player.createdAt).toLocaleDateString(i18n.language)}
									</span>
								</div>
								<div className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-2 md:px-3 md:py-1 text-xs font-semibold ${
									onlineIds.has(player.id)
										? "bg-victory/10 border-victory/40 text-victory"
										: "bg-text-dim/10 border-text-dim/40 text-text-dim"}`}
								>
									<span className={`w-2 h-2 rounded-full ${onlineIds.has(player.id) ? "bg-victory" : "bg-text-dim"}`} />
									<span className="hidden md:inline">
										{onlineIds.has(player.id) ? t("common.online") : t("common.offline")}
									</span>
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
