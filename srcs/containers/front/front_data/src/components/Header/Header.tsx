import Logo from "@/components/Logo/Logo";
import LinkProfile from "@/components/LinkProfile/LinkProfile";
import { useAuth } from "@/context/useAuth";

interface HeaderProps {
	compact?: boolean;
}

function Header({ compact }: HeaderProps) {
	const { profile } = useAuth();

	return (
		<header className={`page-header ${compact ? "py-3! md:py-3!" : ""}`}>
			<Logo />
			<LinkProfile name={profile?.name ? profile.name : "login"} icon="🥷" />
		</header>
	);
}

export default Header;
