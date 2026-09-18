import type { ReactNode } from "react";
import PlayerAvatar from "@/pages/GameRoom/components/PlayerAvatar";

interface PlayerCircleEntry {
	sessionId: string;
	name: string;
	avatarUrl?: string;
	hintWord?: string;
	isActive?: boolean;
}

interface PlayerCircleProps {
	players: PlayerCircleEntry[];
	children?: ReactNode;
}

const RADIUS_PERCENT = 40;

export function getPlayerAngleDeg(index: number, total: number) {
	return total > 0 ? (index / total) * 360 : 0;
}

function PlayerCircle({ players, children }: PlayerCircleProps) {
	return (
		<div className="relative mx-auto aspect-square w-full min-w-[352px] max-w-[500px] lg:max-w-[32vw]">
			<div
				className="border-accent-purple/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
				style={{ width: `${RADIUS_PERCENT * 2}%`, height: `${RADIUS_PERCENT * 2}%` }}
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
						/>
					</div>
				);
			})}
		</div>
	);
}

export default PlayerCircle;
