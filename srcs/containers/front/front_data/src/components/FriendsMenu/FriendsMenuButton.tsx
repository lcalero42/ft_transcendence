import { useFriends } from "@/context/useFriends";

function FriendsMenuButton() {
	const { toggleMenu, unreadCount } = useFriends();

	return (
		<button
			type="button"
			onClick={toggleMenu}
			aria-label="Open friends menu"
			className="clean-btn hoverable relative flex h-5 w-7 flex-col justify-between"
		>
			{[0, 1, 2].map((i) => (
				<span key={i} className="h-0.5 w-full rounded-full bg-white" />
			))}
			{unreadCount > 0 && (
				<span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full bg-friends" />
			)}
		</button>
	);
}

export default FriendsMenuButton;
