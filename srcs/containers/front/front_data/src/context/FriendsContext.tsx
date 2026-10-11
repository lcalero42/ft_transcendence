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
import { FriendsContext } from "./friends-context";

type PresenceRoom = Awaited<ReturnType<typeof client.joinOrCreate>>;
const EMPTY_ONLINE_IDS: Set<number> = new Set();
const PRESENCE_RETRY_MIN_MS = 2000;
const PRESENCE_RETRY_MAX_MS = 30000;

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
	const [friends, setFriends] = useState<Friendship[]>([]);
	const [pending, setPending] = useState<Friendship[]>([]);
	const [onlineIds, setOnlineIds] = useState<Set<number>>(new Set());
	const [unreadCount, setUnreadCount] = useState(0);
	const [roomsVersion, setRoomsVersion] = useState(0);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const roomRef = useRef<PresenceRoom | null>(null);

	const refetchFriends = useCallback(() => refetchInto(getFriends, setFriends), []);
	const refetchPending = useCallback(() => refetchInto(getPendingRequests, setPending), []);

	useEffect(() => {
		if (!isAuth) return;

		refetchFriends();
		refetchPending();

		let cancelled = false;
		let hasJoinedBefore = false;
		let retryDelayMs = PRESENCE_RETRY_MIN_MS;
		let retryTimer: ReturnType<typeof setTimeout> | undefined;

		function scheduleRejoin() {
			if (cancelled) return;
			retryTimer = setTimeout(joinPresence, retryDelayMs);
			retryDelayMs = Math.min(retryDelayMs * 2, PRESENCE_RETRY_MAX_MS);
		}

		function joinPresence() {
			client
			.joinOrCreate("presence", { token: getToken() })
			.then((room) => {
				if (cancelled) {
					void room.leave();
					return;
				}
				roomRef.current = room;
				retryDelayMs = PRESENCE_RETRY_MIN_MS;
				room.reconnection.enabled = false;
				room.onLeave(() => {
					if (roomRef.current !== room) return;
					roomRef.current = null;
					scheduleRejoin();
				});
				if (hasJoinedBefore) {
					refetchFriends();
					refetchPending();
					setRoomsVersion((version) => version + 1);
				}
				hasJoinedBefore = true;

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
				room.onMessage("roomInvite", ({ roomId, fromName }: { roomId: string; fromName: string }) => {
					toast.add({
						type: "info",
						title: i18n.t("friends.roomInviteTitle"),
						description: i18n.t("friends.roomInviteDescription", { name: fromName }),
						timeout: 15000,
						actionProps: {
							children: i18n.t("friends.join"),
							onClick: () => window.location.assign(`/create-room/${roomId}`),
						},
					});
				});
				room.onMessage("friendRequestAccepted",({ fromName }: { fromName: string }) => {
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
				room.onMessage("roomsChanged", () => {
					setRoomsVersion((version) => version + 1);
				});
			})
			.catch(scheduleRejoin);
		}

		joinPresence();

		return () => {
			cancelled = true;
			clearTimeout(retryTimer);
			const room = roomRef.current;
			roomRef.current = null;
			void room?.leave();
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

	const incomingRequests = isAuth ? pending.filter((f) => f.addresseeId === user?.id) : [];
	const outgoingRequests = isAuth ? pending.filter((f) => f.requesterId === user?.id) : [];

	return (
		<FriendsContext.Provider
			value={{
				friends: isAuth ? friends : [],
				incomingRequests,
				outgoingRequests,
				onlineIds: isAuth ? onlineIds : EMPTY_ONLINE_IDS,
				unreadCount: isAuth ? unreadCount : 0,
				roomsVersion,
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
