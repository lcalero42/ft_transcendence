import PlayerListItem from "@/pages/GameRoom/components/PlayerListItem";

interface PlayersListEntry {
	sessionId: string;
	name: string;
	avatarUrl?: string;
	showProfile?: boolean;
	showKick?: boolean;
}

interface PlayersListProps {
	players: PlayersListEntry[];
	onKick?: (sessionId: string) => void;
}

function PlayersList({ players, onKick }: PlayersListProps) {
	return (
		<div className="card mb-0!">
			<h2 className="text-accent-purple mb-2 text-lg font-bold">Players</h2>
			<div className="flex flex-col gap-3">
				{players.map((player) => (
					<PlayerListItem
						key={player.sessionId}
						name={player.name}
						avatarUrl={player.avatarUrl}
						showProfile={player.showProfile}
						showKick={player.showKick}
						onKick={() => onKick?.(player.sessionId)}
					/>
				))}
			</div>
		</div>
	);
}

export default PlayersList;