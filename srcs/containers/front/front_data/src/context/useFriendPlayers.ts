import { otherPlayer } from "../api/friendship";
import { useAuth } from "./useAuth";
import { useFriends } from "./useFriends";

export function useFriendPlayers() {
	const { user } = useAuth();
	const { friends, onlineIds } = useFriends();

	return friends.map((friendship) => {
		const player = otherPlayer(friendship, user?.id);
		return {
			friendshipId: friendship.id,
			...player,
			isOnline: onlineIds.has(player.id),
		};
	});
}
