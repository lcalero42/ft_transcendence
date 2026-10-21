import Edit from "@/components/Popup/Edit";
import { useTranslation } from "react-i18next";

export type KickAction = "kick" | "ban";

type KickConfirmProps = {
	name: string;
	action: KickAction;
	onClose: () => void;
	onConfirm: () => void;
};

function KickConfirm({ name, action, onClose, onConfirm }: KickConfirmProps) {
	const { t } = useTranslation();

	return (
		<Edit onClose={onClose}>
			{(handleClose) => (
				<>
					<h2 className="font-bold text-lg">{t(`game.${action}Title`)}</h2>
					<p className="text-sm text-text-dim">
						{t(`game.${action}Confirm`, { name })}
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
							{t(`game.${action}`)}
						</button>
					</div>
				</>
			)}
		</Edit>
	);
}

export default KickConfirm;
