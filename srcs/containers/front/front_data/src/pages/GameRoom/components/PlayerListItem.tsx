import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Ban, LogOut, MoreVertical, User } from "lucide-react";

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

const menuItemClass =
	"clean-btn flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-small font-semibold transition-colors duration-150";

function PlayerListItem({ name, avatarUrl, isSelf, isHost, isGuest, canKick, expanded, onToggle, onKick, onBan }: PlayerListItemProps) {
	const showKick = canKick && !isSelf;
	const showProfile = !isGuest;
	const hasActions = showKick || showProfile;
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
		<div ref={itemRef} className="flex w-full flex-col">
			<button
				type="button"
				onClick={hasActions ? onToggle : undefined}
				className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors duration-150 ${hasActions ? "" : "cursor-default"}`}
			>
				<img src={avatarUrl} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
				<span className="min-w-0 flex-1 truncate text-body font-semibold">
					{isHost ? name + " 👑" : name}
				</span>
				{hasActions && (
					<span
						className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${expanded ? "bg-circle-bg text-accent-purple" : "text-text-dim"}`}
					>
						<MoreVertical className="size-4" />
					</span>
				)}
			</button>
			{expanded && hasActions && (
				<div className="mt-1 ml-10 flex flex-col gap-0.5 rounded-lg border border-card-border-2 bg-card p-1">
					{showProfile && (
						<Link
							to={`/profile/${encodeURIComponent(name)}`}fix-
							target="_blank"
							rel="noopener noreferrer"
							className={`${menuItemClass} text-victory hover:bg-victory/15`}
						>
							<User className="size-4" />
							{t("game.profile")}
						</Link>
					)}
					{showKick && (
						<>
							{showProfile && <div className="my-0.5 border-t border-card-border-2" />}
							<button
								type="button"
								onClick={onKick}
								className={`${menuItemClass} text-accent-orange hover:bg-accent-orange/15`}
							>
								<LogOut className="size-4" />
								{t("game.kick")}
							</button>
							<button
								type="button"
								onClick={onBan}
								className={`${menuItemClass} text-defeat hover:bg-defeat/15`}
							>
								<Ban className="size-4" />
								{t("game.ban")}
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
}

export default PlayerListItem;
