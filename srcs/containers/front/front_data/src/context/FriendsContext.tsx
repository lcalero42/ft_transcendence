import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { client } from "../lib/colyseusClient";
import { getToken } from "../api/auth/client";
import { toast } from "@/components/ui/toast";
import {
	getFriends,
	getPendingRequests,
	sendFriendRequestByName,
	respondToRequest,
	type Friendship,
} from "../api/friendship";
import { useAuth } from "./useAuth";
import { FriendsContext } from "./friends-context";

type PresenceRoom = Awaited<ReturnType<typeof client.joinOrCreate>>;

export function FriendsProvider({ children }: { children: ReactNode }) {
	const { isAuth, user } = useAuth();
	const [friends, setFriends] = useState<Friendship[]>([]);
	const [pending, setPending] = useState<Friendship[]>([]);
	const [onlineIds, setOnlineIds] = useState<Set<number>>(new Set());
	const [unreadCount, setUnreadCount] = useState(0);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const roomRef = useRef<PresenceRoom | null>(null);

	const refetchFriends = useCallback(() => {
		getFriends().then(setFriends).catch(() => {});
	}, []);

	const refetchPending = useCallback(() => {
		getPendingRequests().then(setPending).catch(() => {});
	}, []);

	useEffect(() => {
		if (!isAuth) {
			setFriends([]);
			setPending([]);
			setOnlineIds(new Set());
			setUnreadCount(0);
			return;
		}

		refetchFriends();
		refetchPending();

		let cancelled = false;

		client
			.joinOrCreate("presence", { token: getToken() })
			.then((room) => {
				if (cancelled) {
					void room.leave();
					return;
				}
				roomRef.current = room;

				room.onMessage("onlineIds", (ids: number[]) => {
					setOnlineIds(new Set(ids));
				});
				room.onMessage("online", ({ playerId }: { playerId: number }) => {
					setOnlineIds((prev) => new Set(prev).add(playerId));
				});
				room.onMessage("offline", ({ playerId }: { playerId: number }) => {
					setOnlineIds((prev) => {
						const next = new Set(prev);
						next.delete(playerId);
						return next;
					});
				});
				room.onMessage("friendRequest", ({ fromName }: { fromName: string }) => {
					toast.add({ type: "info", title: "New friend request", description: `${fromName} sent you a friend request` });
					setUnreadCount((c) => c + 1);
					refetchPending();
				});
				room.onMessage("friendRequestAccepted", ({ fromName }: { fromName: string }) => {
					toast.add({ type: "success", title: "Friend request accepted", description: `${fromName} accepted your friend request` });
					refetchFriends();
					refetchPending();
				});
			})
			.catch(() => {});

		return () => {
			cancelled = true;
			roomRef.current?.leave();
			roomRef.current = null;
		};
	}, [isAuth, user?.id, refetchFriends, refetchPending]);

	function toggleMenu() {
		setIsMenuOpen((prev) => {
			if (!prev) setUnreadCount(0);
			return !prev;
		});
	}

	function closeMenu() {
		setIsMenuOpen(false);
	}

	async function sendRequest(name: string) {
		await sendFriendRequestByName(name);
		refetchPending();
	}

	async function acceptRequest(id: number) {
		await respondToRequest(id, "ACCEPTED");
		refetchFriends();
		refetchPending();
	}

	async function declineRequest(id: number) {
		await respondToRequest(id, "DECLINED");
		refetchPending();
	}

	const incomingRequests = pending.filter((f) => f.addresseeId === user?.id);
	const outgoingRequests = pending.filter((f) => f.requesterId === user?.id);

	return (
		<FriendsContext.Provider
			value={{
				friends,
				incomingRequests,
				outgoingRequests,
				onlineIds,
				unreadCount,
				isMenuOpen,
				toggleMenu,
				closeMenu,
				sendRequest,
				acceptRequest,
				declineRequest,
			}}
		>
			{children}
		</FriendsContext.Provider>
	);
}
