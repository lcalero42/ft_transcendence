import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { client } from "../lib/colyseusClient";
import { getToken } from "../api/auth/client";
import { toast } from "@/components/ui/toast";
import i18n from "@/i18n";
import {
	getFriends,
	getPendingRequests,
	sendFriendRequestByName,
	respondToRequest,
	cancelRequest as cancelRequestApi,
	removeFriend as removeFriendApi,
	type Friendship,
} from "../api/friendship";
import { useAuth } from "./useAuth";
import { FriendsContext, type FriendsStatus } from "./friends-context";

type PresenceRoom = Awaited<ReturnType<typeof client.joinOrCreate>>;
const EMPTY_ONLINE_IDS: Set<number> = new Set();

function refetchInto<T>(fetcher: () => Promise<T[]>, setState: (value: T[]) => void) {
	fetcher().then(setState).catch(() => {});
}

function withRefetch<Args extends unknown[]>(
	action: (...args: Args) => Promise<unknown>,
	refetches: (() => void)[],
) {
	return async (...args: Args) => {
		await action(...args);
		refetches.forEach((refetch) => refetch());
	};
}

export function FriendsProvider({ children }: { children: ReactNode }) {
	const { isAuth, user } = useAuth();
	const [friendsState, setFriendsState] = useState<{
		userId: number | undefined;
		list: Friendship[];
		status: FriendsStatus;
	}>({ userId: undefined, list: [], status: "loading" });
	const [pending, setPending] = useState<Friendship[]>([]);
	const [onlineIds, setOnlineIds] = useState<Set<number>>(new Set());
	const [unreadCount, setUnreadCount] = useState(0);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const roomRef = useRef<PresenceRoom | null>(null);

	const userId = user?.id;
	const refetchFriends = useCallback(() => {
		getFriends()
			.then((list) => {
				setFriendsState({ userId, list, status: "ready" });
			})
			.catch(() => {
				setFriendsState((prev) =>
					prev.userId === userId && prev.status === "ready"
						? prev
						: { userId, list: [], status: "error" },
				);
			});
	}, [userId]);
	const refetchPending = useCallback(() => refetchInto(getPendingRequests, setPending), []);

	useEffect(() => {
		if (!isAuth) return;

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
					toast.add({ type: "info", title: i18n.t("friends.newRequestTitle"), description: i18n.t("friends.newRequestDescription", { name: fromName }) });
					setUnreadCount((c) => c + 1);
					refetchPending();
				});
				room.onMessage("friendRequestAccepted", ({ fromName }: { fromName: string }) => {
					toast.add({ type: "success", title: i18n.t("friends.acceptedTitle"), description: i18n.t("friends.acceptedDescription", { name: fromName }) });
					refetchFriends();
					refetchPending();
				});
				room.onMessage("friendRequestDeclined", () => {
					refetchPending();
				});
				room.onMessage("friendRequestCancelled", () => {
					refetchPending();
				});
				room.onMessage("friendRemoved", () => {
					refetchFriends();
				});
			})
			.catch(() => {});

		return () => {
			cancelled = true;
			void roomRef.current?.leave();
			roomRef.current = null;
		};
	}, [isAuth, user?.id, refetchFriends, refetchPending]);

	function retryFriends() {
		setFriendsState({ userId, list: [], status: "loading" });
		refetchFriends();
	}

	function toggleMenu() {
		setIsMenuOpen((prev) => {
			if (!prev) setUnreadCount(0);
			return !prev;
		});
	}

	function closeMenu() {
		setIsMenuOpen(false);
	}

	const sendRequest = withRefetch(sendFriendRequestByName, [refetchPending]);
	const acceptRequest = withRefetch(
		(id: number) => respondToRequest(id, "ACCEPTED"),
		[refetchFriends, refetchPending],
	);
	const declineRequest = withRefetch(
		(id: number) => respondToRequest(id, "DECLINED"),
		[refetchPending],
	);
	const cancelRequest = withRefetch(cancelRequestApi, [refetchPending]);
	const removeFriend = withRefetch(removeFriendApi, [refetchFriends]);

	// Friends loaded for another account are stale: show them as still loading
	const friendsAreCurrent = isAuth && friendsState.userId === userId;
	const friends = friendsAreCurrent ? friendsState.list : [];
	const friendsStatus: FriendsStatus = friendsAreCurrent ? friendsState.status : "loading";

	const incomingRequests = isAuth ? pending.filter((f) => f.addresseeId === user?.id) : [];
	const outgoingRequests = isAuth ? pending.filter((f) => f.requesterId === user?.id) : [];

	return (
		<FriendsContext.Provider
			value={{
				friends,
				friendsStatus,
				retryFriends,
				incomingRequests,
				outgoingRequests,
				onlineIds: isAuth ? onlineIds : EMPTY_ONLINE_IDS,
				unreadCount: isAuth ? unreadCount : 0,
				isMenuOpen,
				toggleMenu,
				closeMenu,
				sendRequest,
				acceptRequest,
				declineRequest,
				cancelRequest,
				removeFriend,
			}}
		>
			{children}
		</FriendsContext.Provider>
	);
}
