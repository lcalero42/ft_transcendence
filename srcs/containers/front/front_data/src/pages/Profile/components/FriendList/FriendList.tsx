import "./FriendList.css";
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
		<div className="friends-cards">
			<div className="friend-header">
				<div className="friend-title-wrap">
					<div className="friend-title"> My friends </div>
					<span className="friend-count"> ({friends.length})  </span>
				</div>
				<button
					className="btn-view-friends"
					aria-label="View all friends"
					onClick={() => setIsPopupOpen(true)}
				>
					View all
				</button>
			</div>
			<div className="friend-list">
				{topThree.map((f) => (
					<div className="friend-params" key={f.id}>
						<div className="friend-icon"> {f.icon} </div>
						<div className="friend-name-status-wrap">
							<div className="friend-name">{f.name}</div>
							<div className={`friend-status ${f.isOnLine ? "online" : "offline"}`}>
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
