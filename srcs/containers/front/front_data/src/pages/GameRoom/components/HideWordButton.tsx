import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HideWordButtonProps {
	hidden: boolean;
	onToggle: () => void;
}

function HideWordButton({ hidden, onToggle }: HideWordButtonProps) {
	const { t } = useTranslation();
	const Icon = hidden ? Eye : EyeOff;
	const label = t(hidden ? "game.showWord" : "game.hideWord");

	return (
		<button
			type="button"
			onClick={onToggle}
			aria-pressed={hidden}
			aria-label={label}
			title={label}
			className={`badge badge-icon hoverable rounded-lg! shrink-0 ${hidden ? "border-accent-purple text-accent-purple" : ""}`}
		>
			<Icon className="size-[clamp(15px,1.1vw,24px)]" />
		</button>
	);
}

export default HideWordButton;
