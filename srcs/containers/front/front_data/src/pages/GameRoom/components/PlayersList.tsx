import { useState } from "react";
import PlayerListItem from "@/pages/GameRoom/components/PlayerListItem";

interface PlayersListEntry {
	sessionId: string;
	name: string;
	avatarUrl?: string;
	isSelf?: boolean;
}

interface PlayersListProps {
	players: PlayersListEntry[];
	isHost?: boolean;
	onKick?: (sessionId: string) => void;
}

function PlayersList({ players, isHost, onKick }: PlayersListProps) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	return (
		<div className="card mb-0! flex h-full min-h-0 flex-col">
			<h2 className="text-accent-purple mb-2 text-title font-bold">Players</h2>
			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
				{players.map((player) => (
					<PlayerListItem
						key={player.sessionId}
						name={player.name}
						avatarUrl={player.avatarUrl}
						isSelf={player.isSelf}
						canKick={isHost}
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