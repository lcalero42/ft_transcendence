import Edit from "@/components/Popup/Edit";
import { useTranslation } from "react-i18next";

type RemoveFriendConfirmProps = {
	name: string;
	onClose: () => void;
	onConfirm: () => void;
};

function RemoveFriendConfirm({ name, onClose, onConfirm }: RemoveFriendConfirmProps) {
	const { t } = useTranslation();

	return (
		<Edit onClose={onClose}>
			{(handleClose) => (
				<>
					<h2 className="font-bold text-lg">{t("friends.removeTitle")}</h2>
					<p className="text-sm text-text-dim">
						{t("friends.removeConfirm", { name })}
					</p>
					<div className="flex justify-around w-full mt-1">
						<button className="clean-btn text-text-dim transition-[color,text-shadow] duration-200 ease-in-out hover:text-gray-high hover:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-gray-high)_50%,transparent)]" onClick={handleClose}>
							{t("common.cancel")}
						</button>
						<button
							className="clean-btn text-defeat font-semibold transition-[text-shadow] duration-200 ease-in-out hover:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-defeat)_70%,transparent)]"
							onClick={() => {
								onConfirm();
								handleClose();
							}}
						>
							{t("friends.remove")}
						</button>
					</div>
				</>
			)}
		</Edit>
	);
}

export default RemoveFriendConfirm;
