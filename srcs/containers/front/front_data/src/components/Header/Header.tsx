import Logo from "@/components/Logo/Logo";
import LinkProfile from "@/components/LinkProfile/LinkProfile";
import FriendsMenuButton from "@/components/FriendsMenu/FriendsMenuButton";
import { useAuth } from "@/context/useAuth";

interface HeaderProps {
	compact?: boolean;
}

function Header({ compact }: HeaderProps) {
	const { profile, isAuth } = useAuth();

	return (
		<header className={`page-header ${compact ? "py-3! md:py-3!" : ""}`}>
			<div className="flex items-center gap-4">
				<Logo />
				{isAuth && <FriendsMenuButton />}
			</div>
			<LinkProfile name={profile?.name ? profile.name : "login"} icon="🥷" />
		</header>
	);
}

export default Header;
