import { useEffect, useRef, useState } from "react";
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
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handlePointerDown(event: PointerEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setExpandedId(null);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, []);

	return (
		<div ref={containerRef} className="card mb-0! flex h-full min-h-0 flex-col">
			<h2 className="text-accent-purple mb-2 text-[max(1.3vw,16px)] font-bold">Players</h2>
			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
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