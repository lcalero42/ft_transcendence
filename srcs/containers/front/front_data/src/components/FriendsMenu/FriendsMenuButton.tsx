import { useFriends } from "@/context/useFriends";
import { useTranslation } from "react-i18next";

function FriendsMenuButton() {
	const { toggleMenu, unreadCount } = useFriends();
	const { t } = useTranslation();

	return (
		<button
			type="button"
			onClick={toggleMenu}
			aria-label={t("friends.openMenu")}
			className="clean-btn hoverable relative z-50 flex h-5 w-7 shrink-0 flex-col justify-between md:absolute md:top-1/2 md:left-6 md:-translate-y-1/2"
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
