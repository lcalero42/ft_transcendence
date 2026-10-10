import { useTranslation } from "react-i18next";

interface PlayerAvatarProps {
	name: string;
	avatarUrl?: string;
	hintWord?: string;
	isActive?: boolean;
	voteCount?: number;
	isVoteTarget?: boolean;
}

function PlayerAvatar({ name, avatarUrl, hintWord, isActive, voteCount, isVoteTarget }: PlayerAvatarProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center gap-1 md:gap-2">
			<span className={`text-body font-bold ${isActive ? "text-accent-purple" : "text-gray-high"}`}>
				{name}
			</span>
			<div
				className={`relative flex h-[72px] w-[80px] shrink-0 md:h-[max(3.8vw,120px)] md:w-[max(4.8vw,132px)] items-center justify-center rounded-full border ${isActive ? "border-card-accent-border/50" : "border-card-border-2/60"} ${isVoteTarget ? "ring-accent-purple ring-2 shadow-[0_0_18px_#8B57FB]" : ""}`}
			>
				<img
					src={avatarUrl}
					alt={name}
					className="size-14 shrink-0 rounded-full object-cover md:size-[max(3vw,92px)]"
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
				<span className="border-winrate/40 bg-winrate/10 text-winrate text-small max-w-[80px] rounded-2xl md:max-w-[max(4.8vw,132px)] border px-3 py-1 font-bold break-words">
					{hintWord}
				</span>
			)}
		</div>
	);
}

export default PlayerAvatar;
