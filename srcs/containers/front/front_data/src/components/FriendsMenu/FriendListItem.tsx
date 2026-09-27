import { getAvatarUrl } from "@/api/player";

type FriendListItemProps = {
	name: string;
	avatarUrl: string | null;
	isOnline: boolean;
};

function FriendListItem({ name, avatarUrl, isOnline }: FriendListItemProps) {
	return (
		<div className="flex items-center gap-3 py-2">
			<img
				src={getAvatarUrl(avatarUrl)}
				alt=""
				className="h-9 w-9 shrink-0 rounded-full object-cover"
			/>
			<div className="flex-1 truncate text-sm font-medium">{name}</div>
			<span
				className={`h-2.5 w-2.5 shrink-0 rounded-full ${isOnline ? "bg-victory" : "bg-defeat"}`}
			/>
		</div>
	);
}

export default FriendListItem;
