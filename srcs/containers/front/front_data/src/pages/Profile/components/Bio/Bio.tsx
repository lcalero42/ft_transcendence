
import EditIcon from "../EditIcon/EditIcon";
import { useState } from "react";
import {updateBio} from "../../../../api/player"
import EditBio from "./editBio";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
type BioProps = {
	playerId: number;
	bio: string;
	editable?: boolean;
};

function Bio({playerId, bio, editable = true}: BioProps) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [currentBio, setCurrentBio] = useState(bio);
	const { t } = useTranslation();
	const handleBioSave = async (newBio: string) => {
		try {
			const updatedPlayer = await updateBio(playerId, newBio);
			setCurrentBio(updatedPlayer.aboutMe);
		} catch (err) {
			const message = err instanceof Error ? err.message : t("common.errorOccurred");
    		toast.add({
      			type: "error",
      			title: t("profile.bioUpdateFailed"),
			    description: message,
    		});
		}
	};
	return (
		<div className="card gap-0 pr-2 pt-2 border border-card-border-2
		md:bg-transparent md:border-none md:pb-0">
			<div className="flex justify-between">
				<div className="text-left font-bold">{t("profile.aboutMe")}</div>

				{editable && <button
					className="flex clean-btn h-8 "
					aria-label={t("common.modify")}
					onClick={() => setIsPopupOpen(true)}
				>
					<EditIcon color="var(--color-text-dim)"/>
				</button>}
			</div>
			<p className="text-text-dim text-xs text-left max-w-[75%] break-all">
					{currentBio || t("profile.noDescription")}
			</p>
			{isPopupOpen && (
				<EditBio
					currentBio={currentBio}
					onClose={() => setIsPopupOpen(false)}
					onSave={(newBio) => { void handleBioSave(newBio); }}
				/>
			)}
		</div>
	);
}

export default Bio;
