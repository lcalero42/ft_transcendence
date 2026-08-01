
import EditIcon from "../EditIcon/EditIcon";
import { useState } from "react";

type BioProps = {
	bio: string;
};

function Bio({bio}: BioProps) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
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
			<div className="text-text-dim text-xs text-left md:max-w-[75%]">{bio}</div>
		</div>
	);
}

export default Bio;
