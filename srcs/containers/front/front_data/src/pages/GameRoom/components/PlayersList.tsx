import { useState } from "react";
import { useTranslation } from "react-i18next";
import PlayerListItem from "@/pages/GameRoom/components/PlayerListItem";

interface PlayersListEntry {
	sessionId: string;
	name: string;
	avatarUrl?: string;
	isSelf?: boolean;
	isHost?: boolean;
	isGuest?: boolean;
}

interface PlayersListProps {
	players: PlayersListEntry[];
	isHost?: boolean;
	onKick?: (sessionId: string) => void;
	onBan?: (sessionId: string) => void;
}

function PlayersList({ players, isHost, onKick, onBan }: PlayersListProps) {
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const { t } = useTranslation();

	return (
		<div
			className="card border-game-panel-border mb-0! flex h-full min-h-0 flex-col border-2 bg-transparent"
		>
			<h2 className="text-accent-purple border-card-border-2 -mx-5 mb-2 border-b px-5 pb-3 text-left text-title font-bold">
				{t("game.players")}
			</h2>
			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
				{players.map((player) => (
					<PlayerListItem
						key={player.sessionId}
						name={player.name}
						avatarUrl={player.avatarUrl}
						isSelf={player.isSelf}
						isHost={player.isHost}
						isGuest={player.isGuest}
						canKick={isHost}
						expanded={expandedId === player.sessionId}
						onToggle={() => setExpandedId((current) => (current === player.sessionId ? null : player.sessionId))}
						onKick={() => onKick?.(player.sessionId)}
						onBan={() => onBan?.(player.sessionId)}
					/>
				))}
			</div>
		</div>
	);
}

export default PlayersList;
