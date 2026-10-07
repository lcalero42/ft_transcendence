import { useTranslation } from "react-i18next";

interface EndGameButtonProps {
	onClick: () => void;
}

function EndGameButton({ onClick }: EndGameButtonProps) {
	const { t } = useTranslation();

	return (
		<button type="button" onClick={onClick} className="badge badge-action hoverable rounded-lg! shrink-0">
			{t("game.endGame")}
		</button>
	);
}

export default EndGameButton;