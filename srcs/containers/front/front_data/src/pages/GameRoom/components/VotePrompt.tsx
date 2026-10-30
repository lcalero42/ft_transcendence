import { Trans, useTranslation } from "react-i18next";

interface VotePromptProps {
	canVote: boolean;
	votedName?: string;
}

function VotePrompt({ canVote, votedName }: VotePromptProps) {
	const { t } = useTranslation();
	const accent = { accent: <span className="text-accent-purple" /> };
	let instruction = <>{t("game.spectatorVoting")}</>;
	if (canVote && votedName) {
		instruction = <Trans i18nKey="game.votedFor" values={{ name: votedName }} components={accent} />;
	} else if (canVote) {
		instruction = <>{t("game.voteInstruction")}</>;
	}

	return (
		<div className="mx-auto flex w-full min-w-[265px] max-w-2xl flex-col gap-2">
			<p className="hidden text-center text-[clamp(14px,1vw,24px)] font-semibold md:block">
				<Trans i18nKey="game.voteTitle" components={accent} />
			</p>
			<p className="text-center md:mt-2">{instruction}</p>
		</div>
	);
}

export default VotePrompt;
