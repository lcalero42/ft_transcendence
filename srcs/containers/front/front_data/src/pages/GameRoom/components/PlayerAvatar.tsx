import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";

interface PlayerAvatarProps {
	name: string;
	avatarUrl?: string;
	hintWord?: string;
	isActive?: boolean;
}

function PlayerAvatar({ name, avatarUrl, hintWord, isActive }: PlayerAvatarProps) {
	return (
		<div className="flex flex-col items-center gap-1">
			<span className={`text-[clamp(12px,0.85vw,19px)] font-semibold ${isActive ? "text-accent-purple" : "text-white"}`}>
				{name}
			</span>
			<img
				src={avatarUrl || AvatarDefault}
				alt={name}
				className={`size-[4.5vw] shrink-0 rounded-full border-2 object-cover ${isActive ? "border-accent-purple" : "border-transparent"}`}
			/>
			{hintWord && <span className="text-[clamp(12px,0.85vw,19px)] font-bold">{hintWord}</span>}
		</div>
	);
}

export default PlayerAvatar;