import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useFriends } from "@/context/useFriends";
import RequestInput from "./RequestInput";
import SentRequests from "./SentRequests";
import PendingRequests from "./PendingRequests";
import FriendListItem from "./FriendListItem";

function FriendsMenu() {
	const { user } = useAuth();
	const { isMenuOpen, closeMenu, friends, onlineIds, removeFriend } = useFriends();
	const [expandedFriendId, setExpandedFriendId] = useState<number | null>(null);

	const friendPlayers = friends.map((f) => ({
		friendshipId: f.id,
		...(f.requesterId === user?.id ? f.addressee : f.requester),
	}));
	const onlineCount = friendPlayers.filter((p) => onlineIds.has(p.id)).length;

	return (
		<>
			{isMenuOpen && <div className="fixed inset-0 z-100" onClick={closeMenu} />}
			<aside
				className={`fixed inset-y-0 left-0 z-101 w-[min(90vw,420px)] overflow-y-auto
				border-r border-card-border-2 bg-bg-deep p-6 transition-transform
				${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className="mb-6 text-3xl font-bold">Friends</h2>

				<div className="flex flex-col gap-6">
					<RequestInput />
					<SentRequests />
					<PendingRequests />

					<div>
						<div className="mb-2 font-semibold text-accent-purple">
							friends · {onlineCount} online
						</div>
						<div className="card">
							{friendPlayers.length === 0 ? (
								<div className="text-sm text-text-dim">No friends yet</div>
							) : (
								friendPlayers.map((p) => (
									<FriendListItem
										key={p.id}
										name={p.name}
										avatarUrl={p.avatarUrl}
										isOnline={onlineIds.has(p.id)}
										expanded={expandedFriendId === p.friendshipId}
										onToggle={() => setExpandedFriendId((prev) => (prev === p.friendshipId ? null : p.friendshipId))}
										onRemove={() => { void removeFriend(p.friendshipId); }}
									/>
								))
							)}
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}

export default FriendsMenu;
