
import "./Bio.css";
import EditIcon from "../EditIcon/EditIcon";
import { useState } from "react";

type BioProps = {
	bio: string;
};

function Bio({bio}: BioProps) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	return (
		<div className="bio-card">
			<div className="bio-header">
				<div className="about-me">About me</div>

				<button
					className="btn-edit-bio"
					aria-label="Modify"
					onClick={() => setIsPopupOpen(true)}
				>
						<EditIcon color="#9f9ba6"/>
				</button>
			</div>
			<div className="bio">{bio}</div>
		</div>
	);
}

export default Bio;
