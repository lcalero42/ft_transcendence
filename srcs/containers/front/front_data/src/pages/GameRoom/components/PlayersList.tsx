import { useState } from "react";
import PlayerListItem from "@/pages/GameRoom/components/PlayerListItem";

interface PlayersListEntry {
	sessionId: string;
	name: string;
	avatarUrl?: string;
	isSelf?: boolean;
	canKick?: boolean;
}

interface PlayersListProps {
	players: PlayersListEntry[];
	onKick?: (sessionId: string) => void;
}

function PlayersList({ players, onKick }: PlayersListProps) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	return (
		<div className="card mb-0!">
			<h2 className="text-accent-purple mb-2 text-lg font-bold">Players</h2>
			<div className="flex flex-col gap-3">
				{players.map((player) => (
					<PlayerListItem
						key={player.sessionId}
						name={player.name}
						avatarUrl={player.avatarUrl}
						isSelf={player.isSelf}
						canKick={player.canKick}
						expanded={expandedId === player.sessionId}
						onToggle={() => setExpandedId((current) => (current === player.sessionId ? null : player.sessionId))}
						onKick={() => onKick?.(player.sessionId)}
					/>
				))}
			</div>
		</div>
	);
}

export default PlayersList;