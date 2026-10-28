import { Trans, useTranslation } from "react-i18next";

interface VotePromptProps {
	canVote: boolean;
	votedName?: string;
	votedCount: number;
	voterCount: number;
}

function VotePrompt({ canVote, votedName, votedCount, voterCount }: VotePromptProps) {
	const { t } = useTranslation();
	const accent = { accent: <span className="text-accent-purple" /> };
	let instruction = <>{t("game.spectatorVoting")}</>;
	if (canVote && votedName) {
		instruction = <Trans i18nKey="game.votedFor" values={{ name: votedName }} components={accent} />;
	} else if (canVote) {
		instruction = <>{t("game.voteInstruction")}</>;
	}

	return (
		<div className="card mb-0! mx-auto w-full min-w-[265px] max-w-2xl p-[max(1vw,12px)]">
			<p className="text-center text-[clamp(14px,1vw,24px)] font-semibold">
				<Trans i18nKey="game.voteTitle" components={accent} />
			</p>
			<p className="mt-2 text-center">{instruction}</p>
			<p aria-live="polite" className="text-small text-gray-low mt-1 text-right">
				{t("game.votesProgress", { voted: votedCount, total: voterCount })}
			</p>
		</div>
	);
}

export default VotePrompt;
