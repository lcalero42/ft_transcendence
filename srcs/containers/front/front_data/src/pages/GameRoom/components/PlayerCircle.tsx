import type { ReactNode } from "react";
import PlayerAvatar from "@/pages/GameRoom/components/PlayerAvatar";
import { getPlayerAngleDeg } from "@/pages/GameRoom/components/utils";

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

function PlayerCircle({ players, children }: PlayerCircleProps) {
	return (
		<div className="relative mx-auto aspect-square w-full min-w-[352px] max-w-[min(780px,64vh)] lg:max-w-[min(52vw,64vh)]">
			<div
				className="border-accent-purple/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
				style={{ width: `${RADIUS_PERCENT * 2}%`, height: `${RADIUS_PERCENT * 2}%` }}
			/>
			<div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
				style={{
					width: `${(RADIUS_PERCENT * 2 * 2) / 3}%`,
					height: `${(RADIUS_PERCENT * 2 * 2) / 3}%`,
					backgroundColor: "#060C30",
					border: "1px solid #15113A",
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
						/>
					</div>
				);
			})}
		</div>
	);
}

export default PlayerCircle;
