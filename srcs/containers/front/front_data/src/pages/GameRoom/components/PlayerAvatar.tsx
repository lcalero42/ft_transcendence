interface PlayerAvatarProps {
	name: string;
	avatarUrl?: string;
	hintWord?: string;
	isActive?: boolean;
}

function PlayerAvatar({ name, avatarUrl, hintWord, isActive }: PlayerAvatarProps) {
	return (
		<div className="flex flex-col items-center gap-2">
			<span className={`text-body font-bold ${isActive ? "text-accent-purple" : "text-gray-high"}`}>
				{name}
			</span>
			<div
				className={`flex h-[max(4.5vw,40px)] w-[max(5.6vw,52px)] shrink-0 items-center justify-center rounded-full border ${isActive ? "border-card-accent-border/50" : "border-card-border-2/60"}`}
			>
				<img
					src={avatarUrl}
					alt={name}
					className="size-[max(3.6vw,32px)] shrink-0 rounded-full object-cover"
				/>
			</div>
			{hintWord && <span className="text-title font-bold text-white">{hintWord}</span>}
		</div>
	);
}

export default PlayerAvatar;
