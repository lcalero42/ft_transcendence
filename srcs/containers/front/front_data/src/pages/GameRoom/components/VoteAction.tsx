import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VoteActionProps {
	hasVoted: boolean;
  isParticipant: boolean;
	onClick: () => void;
}

function VoteAction({ hasVoted, onClick, isParticipant }: VoteActionProps) {
  const { t } = useTranslation();

  if (!isParticipant)
    return (null);
  if (hasVoted) {
		return (
			<span className="bg-victory flex size-7 shrink-0 items-center justify-center rounded-full text-black">
				<Check className="size-4" strokeWidth={3} />
			</span>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className="clean-btn hoverable rounded-full bg-linear-to-r from-btn-gradient-start to-btn-gradient-end px-4 py-1 text-small font-semibold text-white"
		>
			{t("game.vote")}
		</button>
	);
}

export default VoteAction;
