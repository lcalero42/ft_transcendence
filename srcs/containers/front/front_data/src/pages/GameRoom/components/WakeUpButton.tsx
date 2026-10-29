import { AlarmClock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WakeUpButtonProps {
	onClick: () => void;
}

function WakeUpButton({ onClick }: WakeUpButtonProps) {
	const { t } = useTranslation();
	const label = t("game.wakeUp");

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			title={label}
			className="badge badge-icon hoverable rounded-lg! shrink-0 border-accent-purple text-accent-purple"
		>
			<AlarmClock className="size-[clamp(15px,1.1vw,24px)]" />
		</button>
	);
}

export default WakeUpButton;

