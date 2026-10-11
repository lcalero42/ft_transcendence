import { createContext } from "react";
import type { Friendship } from "../api/friendship";

export interface FriendsContextValue {
	friends: Friendship[];
	incomingRequests: Friendship[];
	outgoingRequests: Friendship[];
	onlineIds: Set<number>;
	unreadCount: number;
	roomsVersion: number;
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
