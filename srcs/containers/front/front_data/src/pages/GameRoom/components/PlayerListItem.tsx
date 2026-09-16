import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";

interface PlayerListItemProps {
	name: string;
	avatarUrl?: string;
	showProfile?: boolean;
	showKick?: boolean;
	onKick?: () => void;
}

function PlayerListItem({ name, avatarUrl, showProfile, showKick, onKick }: PlayerListItemProps) {
	return (
		<div className="flex items-center gap-2">
			<img src={avatarUrl || AvatarDefault} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
			<span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span>
			{(showProfile || showKick) && (
				<div className="flex shrink-0 gap-1">
					{showProfile && <span className="badge bg-victory! border-victory! text-xs">PROFILE</span>}
					{showKick && (
						<button type="button" onClick={onKick} className="badge bg-defeat! border-defeat! hoverable text-xs">
							KICK
						</button>
					)}
				</div>
			)}
		</div>
	);
}

export default PlayerListItem;
