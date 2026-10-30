import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AutoJoinButtonProps {
	enabled: boolean;
	onToggle: () => void;
}

function AutoJoinButton({ enabled, onToggle }: AutoJoinButtonProps) {
	const { t } = useTranslation();
	const label = t("game.autoJoin");

	return (
		<button
			type="button"
			onClick={onToggle}
			aria-pressed={enabled}
			aria-label={label}
			title={label}
			className={`badge badge-icon hoverable rounded-lg! shrink-0 ${enabled ? "border-accent-purple text-accent-purple" : ""}`}
		>
			<UserPlus className="size-[clamp(15px,1.1vw,24px)]" />
		</button>
	);
}

export default AutoJoinButton;
