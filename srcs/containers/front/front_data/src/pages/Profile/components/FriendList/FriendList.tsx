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
	const topThree = friends.slice(0, 3);
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	return (
		<div className="card mb-5 border border-card-border-2">
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
			<div className="flex flex-col gap-3">
				{topThree.map((f) => (
					<div className="flex items-center gap-4" key={f.id}>
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
