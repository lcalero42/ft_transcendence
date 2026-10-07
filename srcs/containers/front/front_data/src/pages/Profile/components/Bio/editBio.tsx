import { useState} from "react";
import { useTranslation } from "react-i18next";
import Edit from "../../../../components/Popup/Edit";

type EditBioProps = {
	currentBio: string;
	onClose: () => void;
	onSave: (bio: string) => void;
};

function EditBio({currentBio, onClose, onSave}: EditBioProps) {
	const [bioValue, setbioValue] = useState(currentBio);
	const { t } = useTranslation();

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setbioValue(e.target.value);
	};

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLTextAreaElement>,
		handleClose: () => void
		) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				onSave(bioValue);
				handleClose();
			}
	};

	return (
		<Edit onClose={onClose}>
			{(handleClose) => (
				<>
					<h2 className="font-bold text-lg">{t("profile.aboutMe")}</h2>
					<textarea className="border border-card-border rounded-lg p-2 text-sm"
						value={bioValue}
						onChange={handleChange}
						onKeyDown={(e) => handleKeyDown(e, handleClose)}
					/>
					<div className="flex justify-around w-full mt-1">
						<button className="clean-btn text-text-dim hoverable hover:font-black" onClick={handleClose}>
							{t("common.cancel")}
						</button>
						<button
							className="clean-btn text-accent font-semibold hoverable hover:font-black"
							onClick={() => {
								onSave(bioValue);
								handleClose();
							}}
						>
							{t("common.save")}
						</button>
					</div>
				</>
			)}
		</Edit>
	);
}

export default EditBio;
