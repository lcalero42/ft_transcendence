import { useTranslation } from "react-i18next";

type PlayerProps = {
	sessionId: string;
	name: string;
	avatarUrl: string;
	isHost: boolean;
	isMe: boolean;
};

type PlayerListProps = {
	players: PlayerProps[];
	maxPlayers: number;
};

function PlayerList({ players, maxPlayers }: PlayerListProps) {
	const { t } = useTranslation();

	return (
		<div className="card bg-transparent md:w-[80%] border border-card-border-2">
			<div className="flex justify-between mb-3">
				<div className="flex gap-1">
					<div className="font-bold"> {t("lobby.playersInGame")} </div>
					<span> ({players.length}/{maxPlayers}) </span>
				</div>
			</div>
			<div className="flex flex-col gap-5 min-h-79 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{players.map((p) => (
					<div className="flex items-center text-left gap-4" key={p.sessionId}>
						<img
							src={p.avatarUrl}
							alt={p.name}
							className="w-8 h-8 rounded-full object-cover shrink-0"
						/>
						<div className="flex flex-col text-left">
							<div className="flex items-center gap-1.5 text-sm font-semibold hoverable hover:font-bold">
								{p.isHost && <span title={t("lobby.host")}>👑</span>}
								{p.name}
								{p.isMe ? ` ${t("lobby.you")}` : ""}
							</div>
							<div className="flex items-center gap-1.5 text-xs text-text-dim">
								<span className="w-2 h-2 rounded-full bg-victory" />
								{t("common.online")}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default PlayerList;
