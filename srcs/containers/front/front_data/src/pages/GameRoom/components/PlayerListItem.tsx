import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";

interface PlayerListItemProps {
	name: string;
	avatarUrl?: string;
	isSelf?: boolean;
	canKick?: boolean;
	expanded?: boolean;
	onToggle?: () => void;
	onKick?: () => void;
}

function PlayerListItem({ name, avatarUrl, isSelf, canKick, expanded, onToggle, onKick }: PlayerListItemProps) {
	const showProfile = expanded;
	const showKick = expanded && canKick && !isSelf;

	return (
		<button type="button" onClick={onToggle} className="flex w-full items-center gap-2 text-left">
			<img src={avatarUrl || AvatarDefault} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
			<span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span>
			{(showProfile || showKick) && (
				<div className="flex shrink-0 gap-1">
					{showProfile && <span className="badge bg-victory! border-victory! text-xs">PROFILE</span>}
					{showKick && (
						<span
							role="button"
							onClick={(event) => {
								event.stopPropagation();
								onKick?.();
							}}
							className="badge bg-defeat! border-defeat! hoverable text-xs"
						>
							KICK
						</span>
					)}
				</div>
			)}
		</button>
	);
}

export default PlayerListItem;
