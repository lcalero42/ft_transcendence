import type { ReactNode } from "react";

interface PlayerAvatarProps {
	name: string;
	avatarUrl?: string;
	hintWord?: string;
	isActive?: boolean;
	voteCount?: number;
	action?: ReactNode;
}

function PlayerAvatar({ name, avatarUrl, hintWord, isActive, voteCount, action }: PlayerAvatarProps) {
	return (
		<div className="flex flex-col items-center gap-2">
			{typeof voteCount === "number" && (
				<span className="text-small font-semibold text-accent-purple">{voteCount} votes</span>
			)}
			<span className={`text-body font-bold ${isActive ? "text-accent-purple" : "text-gray-high"}`}>
				{name}
			</span>
			<div
				className={`flex h-[max(3.8vw,120px)] w-[max(4.8vw,132px)] shrink-0 items-center justify-center rounded-full border ${isActive ? "border-card-accent-border/50" : "border-card-border-2/60"}`}
			>
				<img
					src={avatarUrl}
					alt={name}
					className="size-[max(3vw,92px)] shrink-0 rounded-full object-cover"
				/>
			</div>
			{hintWord && <span className="text-title font-bold text-white">{hintWord}</span>}
			{action}
		</div>
	);
}

export default PlayerAvatar;
