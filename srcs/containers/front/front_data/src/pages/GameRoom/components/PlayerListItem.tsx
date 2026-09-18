import { useEffect, useRef } from "react";

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
			<img src={avatarUrl} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
			<span className="min-w-0 flex-1 truncate text-body font-semibold">{name}</span>
			{(expanded || showKick) && (
				<div className="flex shrink-0 gap-1">
					{expanded && (
						<span className="badge bg-victory! border-victory! text-small">PROFILE</span>
					)}
					{showKick && (
						<span
							role="button"
							onClick={(event) => {
								event.stopPropagation();
								onKick?.();
							}}
							className="badge bg-defeat! border-defeat! hoverable text-small"
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
