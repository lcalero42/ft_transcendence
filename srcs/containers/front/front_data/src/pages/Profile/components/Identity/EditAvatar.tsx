import { useState} from "react";
import { useTranslation } from "react-i18next";
import Edit from "../../../../components/Popup/Edit";

type EditAvatarProps = {
	currentAvatar: string;
	onClose: () => void;
	onSave: (file: File) => void;
};

function EditAvatar({currentAvatar, onClose, onSave}: EditAvatarProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar);
	const { t } = useTranslation();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	return (
		<Edit onClose={onClose}>
			{(handleClose) => (
				<>
					<h2 className="font-bold text-lg">{t("profile.yourAvatar")}</h2>
					<img src={previewUrl} alt={t("profile.avatarPreview")} className="w-32 h-32 rounded-full"/>
					<label className="clean-btn font-medium min-w-60 text-accent transition-[text-shadow] duration-200 ease-in-out hover:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-accent)_70%,transparent)]">
						{t("profile.modifyPhoto")}
						<input
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleFileChange}
						/>
					</label>

				<div className="flex justify-around w-full mt-1">
					<button className="clean-btn text-text-dim transition-[color,text-shadow] duration-200 ease-in-out hover:text-gray-high hover:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-gray-high)_50%,transparent)]" onClick={handleClose}>
						{t("common.cancel")}
					</button>
					<button
						className="clean-btn text-accent font-semibold transition-[text-shadow] duration-200 ease-in-out hover:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-accent)_70%,transparent)]"
						onClick={() => {
							if (selectedFile) onSave(selectedFile);
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

export default EditAvatar;
