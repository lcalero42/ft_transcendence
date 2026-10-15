import Edit from "@/components/Popup/Edit";
import { useTranslation } from "react-i18next";

type KickConfirmProps = {
	name: string;
	onClose: () => void;
	onConfirm: () => void;
};

function KickConfirm({ name, onClose, onConfirm }: KickConfirmProps) {
	const { t } = useTranslation();

	return (
		<Edit onClose={onClose}>
			{(handleClose) => (
				<>
					<h2 className="font-bold text-lg">{t("game.kickTitle")}</h2>
					<p className="text-sm text-text-dim">
						{t("game.kickConfirm", { name })}
					</p>
					<div className="flex justify-around w-full mt-1">
						<button className="clean-btn text-text-dim hoverable hover:font-black" onClick={handleClose}>
							{t("common.cancel")}
						</button>
						<button
							className="clean-btn text-defeat font-semibold hoverable hover:font-black"
							onClick={() => {
								onConfirm();
								handleClose();
							}}
						>
							{t("game.kick")}
						</button>
					</div>
				</>
			)}
		</Edit>
	);
}

export default KickConfirm;
