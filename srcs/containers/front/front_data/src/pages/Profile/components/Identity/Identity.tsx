import "./Identity.css";
import Icon from "../../../../assets/icons/calendar-time.svg";
// import editIcon from "../../../../assets/icons/edit-pencil.svg";
import avatar from "../../../../assets/profile-photo/moon.png";

import { useState } from "react";

type IdentityProps = {
	username: string;
	Since: string;
};

function Identity({username, Since}: IdentityProps) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	return (
		<div className="identity">
			<div className="avatar">
				<img src={avatar} alt={username} />
				<button
					className="=edit-avatar"
					aria-label="Modifier"
					onClick={() => setIsPopupOpen(true)}
				>
					,sp
				</button>
			<div/>
			<div className="identity-wrapper">
				<div className="user-name">
					{username}
				</div>
				<div className="user-since">
					<div className="date-icon"
						style={{
							WebkitMaskImage: `url("${Icon}")`,
							maskImage: `url("${Icon}")`,
						}}
					/>
					<div className="user-date">
						member since {Since}
					</div>
				</div>
			</div>
		</div>

	);
}

export default Identity;
