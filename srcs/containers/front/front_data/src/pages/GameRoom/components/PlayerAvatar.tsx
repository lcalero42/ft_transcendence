import { useTranslation } from "react-i18next";

interface PlayerAvatarProps {
	name: string;
	avatarUrl?: string;
	hintWord?: string;
	isActive?: boolean;
	voteCount?: number;
	isVoteTarget?: boolean;
	isAimed?: boolean;
}

function PlayerAvatar({ name, avatarUrl, hintWord, isActive, voteCount, isVoteTarget, isAimed }: PlayerAvatarProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center gap-1 md:gap-2">
			<span className={`text-body font-bold ${isActive ? "text-accent-purple" : "text-gray-high"}`}>
				{name}
			</span>
			<div
				className={`relative flex h-[65px] w-[72px] shrink-0 md:h-[max(3.8vw,120px)] md:w-[max(4.8vw,132px)] items-center justify-center rounded-full border transition-[scale,border-color,box-shadow] duration-200 ease-in-out ${isActive ? "border-card-accent-border/50" : "border-card-border-2/60"} ${isAimed ? "scale-105 border-accent-purple/70 shadow-[0_0_14px_#8B57FB66]" : ""} ${isVoteTarget ? "ring-accent-purple ring-2 shadow-[0_0_18px_#8B57FB]" : ""}`}
			>
				<img
					src={avatarUrl}
					alt={name}
					className="size-[50px] shrink-0 rounded-full object-cover md:size-[max(3vw,92px)]"
				/>
				{!!voteCount && (
					<span
						aria-label={t("game.votes", { count: voteCount })}
						title={t("game.votes", { count: voteCount })}
						className="bg-accent-purple border-bg-deep text-small absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 px-1 font-bold text-white md:h-8 md:min-w-8 md:text-body"
					>
						{voteCount}
					</span>
				)}
			</div>
			{hintWord && (
				<span className="border-winrate/40 bg-winrate/10 text-winrate text-[9px] md:text-small max-w-[72px] rounded-2xl md:max-w-[max(4.8vw,132px)] border px-[11px] py-[3px] md:px-3 md:py-1 font-bold break-words">
					{hintWord}
				</span>
			)}
		</div>
	);
}

export default PlayerAvatar;
