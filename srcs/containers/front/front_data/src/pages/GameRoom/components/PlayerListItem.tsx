import { useEffect, useRef } from "react";
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
	const itemRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!expanded) return;

		function handlePointerDown(event: PointerEvent) {
			if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
				onToggle?.();
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [expanded, onToggle]);

	return (
		<button
			ref={itemRef}
			type="button"
			onClick={onToggle}
			className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors ${expanded ? "bg-accent-hover" : ""}`}
		>
			<img src={avatarUrl || AvatarDefault} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
			<span className="min-w-0 flex-1 truncate text-[clamp(12px,0.85vw,19px)] font-semibold">{name}</span>
			{(showProfile || showKick) && (
				<div className="flex shrink-0 gap-1">
					{showProfile && (
						<span className="badge bg-victory! border-victory! text-[clamp(10px,0.7vw,17px)]">PROFILE</span>
					)}
					{showKick && (
						<span
							role="button"
							onClick={(event) => {
								event.stopPropagation();
								onKick?.();
							}}
							className="badge bg-defeat! border-defeat! hoverable text-[clamp(10px,0.7vw,17px)]"
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
