import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HideWordButtonProps {
	hidden: boolean;
	onToggle: () => void;
}

function HideWordButton({ hidden, onToggle }: HideWordButtonProps) {
	const { t } = useTranslation();
	const Icon = hidden ? Eye : EyeOff;

	return (
		<button
			type="button"
			onClick={onToggle}
			aria-pressed={hidden}
			className={`badge badge-action hoverable rounded-lg! shrink-0 gap-[max(0.6vw,8px)] ${hidden ? "border-accent-purple text-accent-purple" : ""}`}
		>
			<Icon className="size-[clamp(15px,1.1vw,24px)]" />
			{t(hidden ? "game.showWord" : "game.hideWord")}
		</button>
	);
}

export default HideWordButton;
