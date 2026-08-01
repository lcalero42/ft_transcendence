import { useState } from "react";
type FriendProps = {
	id: number;
	name: string;
	icon: string;
	isOnLine: boolean;
};

type FriendListProps = {
	friends: FriendProps[];
};

function FriendList({friends}: FriendListProps) {
	const top = friends.slice(0, 5);
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	return (
		<div className="card md:w-[80%] border border-card-border-2">
			<div className="flex justify-between">
				<div className="flex gap-1">
					<div className="font-bold"> My friends </div>
					<span> ({friends.length}) </span>
				</div>
				<button
					className="clean-btn font-medium text-accent hoverable hover:font-black"
					aria-label="View all friends"
					onClick={() => setIsPopupOpen(true)}
				>
					View all
				</button>
			</div>
			<div className="flex flex-col gap-5">
				{top.map((f, index) => (
					<div className={`flex items-center text-left gap-4
					${index >= 3 ? "hidden md:flex" : ""}`}
					key={f.id}>
						<div className="text-3xl"> {f.icon} </div>
						<div className="flex flex-col text-left">
							<div className="text-sm font-semibold">{f.name}</div>
							<div className="flex items-center gap-1.5 text-xs text-text-dim">
								 <span
								 	className={`w-2 h-2 rounded-full
										${f.isOnLine ? "bg-victory" : "bg-text-dim"}`}
								/>
								{f.isOnLine ? "Online" : "Offline"}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default FriendList;
