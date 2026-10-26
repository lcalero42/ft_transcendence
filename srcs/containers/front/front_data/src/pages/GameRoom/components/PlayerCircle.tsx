import type { ReactNode } from "react";
import PlayerAvatar from "@/pages/GameRoom/components/PlayerAvatar";
import { getPlayerAngleDeg } from "@/pages/GameRoom/components/utils";

interface PlayerCircleEntry {
	sessionId: string;
	name: string;
	avatarUrl?: string;
	hintWord?: string;
	isActive?: boolean;
	voteCount?: number;
	isVoteTarget?: boolean;
	isAimable?: boolean;
	isAimed?: boolean;
	isEliminated?: boolean;
}

interface PlayerCircleProps {
	players: PlayerCircleEntry[];
	children?: ReactNode;
	onAim?: (sessionId: string | null) => void;
	onSelect?: (sessionId: string) => void;
	safeRevealStartMs?: number;
}

const RADIUS_PERCENT = 40;
const SAFE_STAGGER_MS = 150;

function PlayerCircle({ players, children, onAim, onSelect, safeRevealStartMs }: PlayerCircleProps) {
	const canAim = players.some((player) => player.isAimable);

	function findAimedSessionId(event: React.MouseEvent<HTMLDivElement>) {
		const bounds = event.currentTarget.getBoundingClientRect();
		const offsetX = event.clientX - (bounds.left + bounds.width / 2);
		const offsetY = event.clientY - (bounds.top + bounds.height / 2);
		const pointerAngle = ((Math.atan2(offsetX, -offsetY) * 180) / Math.PI + 360) % 360;
		let aimedSessionId: string | null = null;
		let smallestGap = Infinity;

		for (const [index, player] of players.entries()) {
			if (!player.isAimable) continue;
			const difference = Math.abs(getPlayerAngleDeg(index, players.length) - pointerAngle);
			const gap = Math.min(difference, 360 - difference);
			if (gap < smallestGap) {
				smallestGap = gap;
				aimedSessionId = player.sessionId;
			}
		}

		return aimedSessionId;
	}

	function handleSelect(event: React.MouseEvent<HTMLDivElement>) {
		const aimedSessionId = findAimedSessionId(event);
		if (aimedSessionId) onSelect?.(aimedSessionId);
	}

	return (
		<div
			className={`relative mx-auto aspect-square w-full min-w-[300px] max-w-[min(780px,64vh)] lg:max-w-[min(52vw,64vh)] ${canAim ? "cursor-pointer" : ""}`}
			onPointerMove={canAim ? (event) => onAim?.(findAimedSessionId(event)) : undefined}
			onPointerLeave={canAim ? () => onAim?.(null) : undefined}
			onClick={canAim ? handleSelect : undefined}
		>
			<div
				className="border-game-panel-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
				style={{
					width: `${RADIUS_PERCENT * 2}%`,
					height: `${RADIUS_PERCENT * 2}%`,
				}}
			/>
			<div
				className="border-game-panel-border bg-game-circle-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
				style={{
					width: `${(RADIUS_PERCENT * 2 * 2) / 3}%`,
					height: `${(RADIUS_PERCENT * 2 * 2) / 3}%`,
				}}
			/>
			<div className="absolute inset-0 flex items-center justify-center">{children}</div>
			{players.map((player, index) => {
				const angle = (getPlayerAngleDeg(index, players.length) * Math.PI) / 180;
				const left = 50 + RADIUS_PERCENT * Math.sin(angle);
				const top = 50 - RADIUS_PERCENT * Math.cos(angle);

				return (
					<div
						key={player.sessionId}
						className="absolute -translate-x-1/2 -translate-y-1/2"
						style={{ left: `${left}%`, top: `${top}%` }}
					>
						<PlayerAvatar
							name={player.name}
							avatarUrl={player.avatarUrl}
							hintWord={player.hintWord}
							isActive={player.isActive}
							voteCount={player.voteCount}
							isVoteTarget={player.isVoteTarget}
							isAimed={player.isAimed}
							isEliminated={player.isEliminated}
							safeDelayMs={safeRevealStartMs === undefined ? undefined : safeRevealStartMs + index * SAFE_STAGGER_MS}
						/>
					</div>
				);
			})}
		</div>
	);
}

export default PlayerCircle;
