import { createContext } from "react";
import type { Friendship } from "../api/friendship";

export type FriendsStatus = "loading" | "ready" | "error";

export interface FriendsContextValue {
	friends: Friendship[];
	friendsStatus: FriendsStatus;
	retryFriends: () => void;
	incomingRequests: Friendship[];
	outgoingRequests: Friendship[];
	onlineIds: Set<number>;
	unreadCount: number;
	isMenuOpen: boolean;
	toggleMenu: () => void;
	closeMenu: () => void;
	sendRequest: (name: string) => Promise<void>;
	acceptRequest: (id: number) => Promise<void>;
	declineRequest: (id: number) => Promise<void>;
	cancelRequest: (id: number) => Promise<void>;
	removeFriend: (id: number) => Promise<void>;
}

export const FriendsContext = createContext<FriendsContextValue | undefined>(undefined);
