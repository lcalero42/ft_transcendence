import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAvatarUrl } from "@/api/player";
import RemoveFriendConfirm from "./RemoveFriendConfirm";

type FriendListItemProps = {
	name: string;
	avatarUrl: string | null;
	isOnline: boolean;
	expanded: boolean;
	onToggle: () => void;
	onRemove: () => void;
};

function FriendListItem({ name, avatarUrl, isOnline, expanded, onToggle, onRemove }: FriendListItemProps) {
	const [showConfirm, setShowConfirm] = useState(false);
	const itemRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();

	useEffect(() => {
		if (!expanded) return;

		function handlePointerDown(event: PointerEvent) {
			if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
				onToggle();
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [expanded, onToggle]);

	return (
		<div
			ref={itemRef}
			className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${expanded ? "bg-accent-hover" : ""}`}
		>
			<button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
				<img
					src={getAvatarUrl(avatarUrl)}
					alt=""
					className="h-9 w-9 shrink-0 rounded-full object-cover"
				/>
				<span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
			</button>
			{expanded && (
				<button
					type="button"
					aria-label={t("friends.removeAria", { name })}
					onClick={() => setShowConfirm(true)}
					className="clean-btn hoverable flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-defeat text-white"
				>
					<X size={16} />
				</button>
			)}
			<span
				className={`h-2.5 w-2.5 shrink-0 rounded-full ${isOnline ? "bg-victory" : "bg-defeat"}`}
			/>
			{showConfirm && (
				<RemoveFriendConfirm
					name={name}
					onClose={() => setShowConfirm(false)}
					onConfirm={onRemove}
				/>
			)}
		</div>
	);
}

export default FriendListItem;
