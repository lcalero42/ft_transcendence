import Icon from "../../../../assets/icons/calendar-time.svg";
import Avatar from "../../../../assets/profile-photo/moon.png";
import EditIcon from "../EditIcon/EditIcon";
import { useState } from "react";

type IdentityProps = {
	username: string;
	Since: string;
};

function Identity({username, Since}: IdentityProps) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	return (
		<div className="flex justify-between pb-5">
			<div className="relative">

				<img src={Avatar} alt={username}/>
				<button
					className=" flex justify-center items-center
					absolute bottom-4 right-4.5
					h-8 w-9.5 rounded-xl bg-card/87 border-2 border-card-border
					clean-ptn hoverable hover:bg-card/52"
					aria-label="Modify"
					onClick={() => setIsPopupOpen(true)}
				>
					<EditIcon/>
				</button>
			</div>
			<div className="flex flex-col pt-5 gap-2">
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
		</div>

	);
}

export default Identity;
