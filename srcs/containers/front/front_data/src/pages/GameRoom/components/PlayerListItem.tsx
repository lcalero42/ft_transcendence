import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface PlayerListItemProps {
	name: string;
	avatarUrl?: string;
	isSelf?: boolean;
	isHost?: boolean;
	isGuest?: boolean;
	canKick?: boolean;
	expanded?: boolean;
	onToggle?: () => void;
	onKick?: () => void;
	onBan?: () => void;
}

function PlayerListItem({ name, avatarUrl, isSelf, isHost, isGuest, canKick, expanded, onToggle, onKick, onBan }: PlayerListItemProps) {
	const showKick = expanded && canKick && !isSelf;
	const showProfile = expanded && !isGuest;
	const itemRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();

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
		<div
			ref={itemRef}
			className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 transition-colors ${expanded ? "bg-accent-hover" : ""}`}
		>
			<button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left">
				<img src={avatarUrl} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
				<span
					className={`min-w-0 flex-1 truncate text-body font-semibold`}
				>
					{isHost ? name + " 👑" : name}
				</span>
			</button>
			{(showProfile || showKick) && (
				<div className="flex shrink-0 gap-1">
					{showProfile && (
						<Link
							to={`/profile/${encodeURIComponent(name)}`}
							target="_blank"
							rel="noopener noreferrer"
							className="badge bg-victory! border-victory! hoverable text-small"
						>
							{t("game.profile")}
						</Link>
					)}
					{showKick && (
						<button type="button" onClick={onKick} className="badge bg-defeat! border-defeat! hoverable text-small">
							{t("game.kick")}
						</button>
					)}
					{showKick && (
						<button type="button" onClick={onBan} className="badge bg-defeat! border-defeat! hoverable text-small">
							{t("game.ban")}
						</button>
					)}
				</div>
			)}
		</div>
	);
}

export default PlayerListItem;
