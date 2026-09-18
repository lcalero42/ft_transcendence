interface PlayerAvatarProps {
	name: string;
	avatarUrl?: string;
	hintWord?: string;
	isActive?: boolean;
}

function PlayerAvatar({ name, avatarUrl, hintWord, isActive }: PlayerAvatarProps) {
	return (
		<div className="flex flex-col items-center gap-1">
			<span className={`text-body font-semibold ${isActive ? "text-accent-purple" : "text-white"}`}>
				{name}
			</span>
			<img
				src={avatarUrl}
				alt={name}
				className={`size-[max(4.5vw,40px)] shrink-0 rounded-full border-2 object-cover ${isActive ? "border-accent-purple" : "border-transparent"}`}
			/>
			{hintWord && <span className="text-body font-bold">{hintWord}</span>}
		</div>
	);
}

export default PlayerAvatar;
