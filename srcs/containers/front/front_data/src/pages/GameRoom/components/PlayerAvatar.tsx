import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface PlayerAvatarProps {
	name: string;
	avatarUrl?: string;
	hintWord?: string;
	isActive?: boolean;
	voteCount?: number;
	action?: ReactNode;
}

function PlayerAvatar({ name, avatarUrl, hintWord, isActive, voteCount, action }: PlayerAvatarProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center gap-1 md:gap-2">
			{typeof voteCount === "number" && (
				<span className="text-small font-semibold text-accent-purple">{t("game.votes", { count: voteCount })}</span>
			)}
			<span className={`text-body font-bold ${isActive ? "text-accent-purple" : "text-gray-high"}`}>
				{name}
			</span>
			<div
				className={`flex h-[72px] w-[80px] shrink-0 md:h-[max(3.8vw,120px)] md:w-[max(4.8vw,132px)] items-center justify-center rounded-full border ${isActive ? "border-card-accent-border/50" : "border-card-border-2/60"}`}
			>
				<img
					src={avatarUrl}
					alt={name}
					className="size-14 shrink-0 rounded-full object-cover md:size-[max(3vw,92px)]"
				/>
			</div>
			{hintWord && (
				<span className="border-winrate/40 bg-winrate/10 text-winrate text-small max-w-[80px] rounded-2xl md:max-w-[max(4.8vw,132px)] border px-3 py-1 font-bold break-words">
					{hintWord}
				</span>
			)}
			{action}
		</div>
	);
}

export default PlayerAvatar;
