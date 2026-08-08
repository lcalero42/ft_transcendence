import { useState, useEffect } from "react";

type EditAvatarProps = {
	currentAvatar: string;
	onClose: () => void;
	onSave: (file: File) => void;
};

function EditAvatar({currentAvatar, onClose, onSave}: EditAvatarProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 10);
		return () => clearTimeout(timer);
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(onClose, 200);
	};

	const handleSubmit = () => {
		if (selectedFile) {
			onSave(selectedFile);
		}
		handleClose();
	};
	return (
		<div className={`fixed inset-0 z-101 flex flex-col items-center justify-center bg-black/50
		hoverable transition-opacity ${isVisible ? "opacity-100" : "opacity-0"}`}
		onClick={handleClose}>
			<div className="card bg-card/80 md:w-80  border border-card-border-2 items-center"
			onClick={(e) => e.stopPropagation()}>
				<h2 className="font-bold text-lg">Your avatar</h2>
				<img src={previewUrl} alt="Avatar preview" className="w-32 h-32 rounded-full"/>
				<label className="clean-btn font-medium text-accent hoverable hover:font-black">
					Modify photo
					<input
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleFileChange}
					/>
				</label>

				<div className="flex justify-around w-full mt-1">
					<button className="clean-btn text-text-dim hoverable hover:font-black" onClick={handleClose}>
						Cancel
					</button>
					<button
						className="clean-btn text-accent font-semibold hoverable hover:font-black"
						onClick={handleSubmit}
						// disabled={!selectedFile}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}

export default EditAvatar;
