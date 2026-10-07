import { useTranslation } from "react-i18next";

interface StartGameButtonProps {
	onClick: () => void;
	disabled?: boolean;
}

function StartGameButton({ onClick, disabled }: StartGameButtonProps) {
	const { t } = useTranslation();

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="badge badge-action hoverable rounded-lg! shrink-0 disabled:opacity-50"
		>
			{t("game.startGame")}
		</button>
	);
}

export default StartGameButton;
