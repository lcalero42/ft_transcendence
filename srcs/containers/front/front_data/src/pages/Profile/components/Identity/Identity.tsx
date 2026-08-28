import Icon from "../../../../assets/icons/calendar-time.svg";
import AvatarDefault from "../../../../assets/profile-photo/avatar-default.svg";

import EditIcon from "../EditIcon/EditIcon";
import { useState } from "react";
import { updateAvatar} from '../../../../api/player';
import EditAvatar from "./EditAvatar";


type IdentityProps = {
	playerId: number;
	username: string;
	Since: string;
	urlAvatar: string;
};

function Identity({playerId, username, Since, urlAvatar}: IdentityProps) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [avatar, setAvatar] = useState(urlAvatar ? urlAvatar : AvatarDefault);

	const handleAvatarSave = async (file: File) => {
		try {
			const updatedPlayer = await updateAvatar(playerId, file);
			const fullUrl = `${import.meta.env.VITE_API_URL}${updatedPlayer.avatarUrl}`;
			setAvatar(fullUrl);
		} catch (err) {
			console.error(err);
		}
	};
	return (
		<div className="flex items-center gap-2 mb-5 md:mb-0">
			<div className="relative w-24 h-24 shrink-0">

				<img src={avatar} alt={username} className="w-full h-full rounded-full object-cover"/>
				<button
					className=" flex clean-btn justify-center items-center
					absolute bottom-1 right-1
					h-8 w-9.5 rounded-xl bg-card/87 border-2 border-card-border
					 hoverable hover:bg-card/52"
					aria-label="Modify"
					onClick={() => setIsPopupOpen(true)}
				>
					<EditIcon/>
				</button>
			</div>
			<div className="flex flex-col pb-5 gap-2">
				<div className="flex font-black text-2xl">
					{username}
				</div>
				<div className="flex gap-2 font-medium">
					<div className="mask-icon w-4 h-4 bg-text-dim"
						style={{
							WebkitMaskImage: `url("${Icon}")`,
							maskImage: `url("${Icon}")`,
						}}
					/>
					<div className="text-left text-text-dim text-xs">
						member since {Since}
					</div>
				</div>
			</div>
			{isPopupOpen && (
				<EditAvatar
					currentAvatar={avatar}
					onClose={() => setIsPopupOpen(false)}
					onSave={handleAvatarSave}
				/>
			)}
		</div>

	);
}

export default Identity;
