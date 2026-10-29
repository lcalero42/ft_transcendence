import { AlarmClock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WakeUpButtonProps {
	onClick: () => void;
}

function WakeUpButton({ onClick }: WakeUpButtonProps) {
	const { t } = useTranslation();

	return (
		<button
			type="button"
			onClick={onClick}
			className="badge badge-action hoverable rounded-lg! shrink-0 gap-[max(0.6vw,8px)] border-accent-purple text-accent-purple"
		>
			<AlarmClock className="size-[clamp(15px,1.1vw,24px)]" />
			{t("game.wakeUp")}
		</button>
	);
}

export default WakeUpButton;
