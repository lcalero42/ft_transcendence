
import EditIcon from "../EditIcon/EditIcon";
import { useState } from "react";
import {updateBio} from "../../../../api/player"
import EditBio from "./editBio";
import { toast } from "@/components/ui/toast";
type BioProps = {
	playerId: number;
	bio: string;
};

function Bio({playerId, bio}: BioProps) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [currentBio, setCurrentBio] = useState(bio);
	const handleBioSave = async (newBio: string) => {
		try {
			const updatedPlayer = await updateBio(playerId, newBio);
			setCurrentBio(updatedPlayer.aboutMe);
		} catch (err) {
			const message = err instanceof Error ? err.message : "An error occured";
    		toast.add({
      			title: "Failed to update bio",
			    description: message,
    		});
		}
	};
	return (
		<div className="card gap-0 pr-2 pt-2 border border-card-border-2
		md:bg-transparent md:border-none md:pb-0">
			<div className="flex justify-between">
				<div className="text-left font-bold">About me</div>

				<button
					className="flex clean-btn h-8 "
					aria-label="Modify"
					onClick={() => setIsPopupOpen(true)}
				>
					<EditIcon color="var(--color-text-dim)"/>
				</button>
			</div>
			<p className="text-text-dim text-xs text-left max-w-[75%] break-all">
					{currentBio}
			</p>
			{isPopupOpen && (
				<EditBio
					currentBio={currentBio}
					onClose={() => setIsPopupOpen(false)}
					onSave={handleBioSave}
				/>
			)}
		</div>
	);
}

export default Bio;
