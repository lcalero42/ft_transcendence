import { useTranslation } from "react-i18next";

interface JoinButtonProps {
	isParticipant: boolean;
	onClick: () => void;
}

function JoinButton({ isParticipant, onClick }: JoinButtonProps) {
	const { t } = useTranslation();
	const colors = isParticipant
		? "bg-transparent! border-defeat/75! text-defeat/80 hover:bg-defeat/75! hover:border-defeat/75! hover:text-black/80"
		: "bg-transparent! border-victory/75! text-victory/80 hover:bg-victory/75! hover:border-victory/75! hover:text-black/80";

	return (
		<button
			type="button"
			onClick={onClick}
			className={`badge badge-action hoverable cursor-pointer rounded-lg! shrink-0 font-semibold ${colors}`}
		>
			{isParticipant ? t("game.leave") : t("game.join")}
		</button>
	);
}

export default JoinButton;
