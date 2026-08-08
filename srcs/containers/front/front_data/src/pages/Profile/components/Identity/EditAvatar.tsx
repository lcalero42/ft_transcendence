import { useState } from "react";

type EditAvatarProps = {
	currentAvatar: string;
	onClose: () => void;
	onSave: (file: File) => void;
};

function EditAvatar({currentAvatar, onClose, onSave}: EditAvatarProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	const handleSubmit = () => {
		if (selectedFile) {
			onSave(selectedFile);
		}
		onClose();
	};
	return (
		<div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60">
			<div className="card w-96 border border-card-border-2 items-center">
				<h2 className="font-bold text-lg mb-4">Change your avatar</h2>

				<img
					src={previewUrl}
					alt="Avatar preview"
					className="w-32 h-32 rounded-full object-cover mb-4"
				/>

				<label className="clean-btn bg-accent-purple px-4 py-2 rounded-lg cursor-pointer mb-4">
					Choose a photo
					<input
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleFileChange}
					/>
				</label>

				<div className="flex justify-end gap-2 w-full mt-2">
					<button className="clean-btn" onClick={onClose}>
						Cancel
					</button>
					<button
						className="clean-btn bg-accent-purple px-4 py-2 rounded-lg"
						onClick={handleSubmit}
						disabled={!selectedFile}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}

export default EditAvatar;
