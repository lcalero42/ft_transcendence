import Logo from "@/components/Logo/Logo";
import LinkProfile from "@/components/LinkProfile/LinkProfile";
import { useAuth } from "@/context/useAuth";

function GameHeader() {
	const { profile } = useAuth();

	return (
		<header className="page-header py-3! md:py-3!">
			<Logo />
			<LinkProfile name={profile?.name ? profile.name : "login"} icon="🥷" />
		</header>
	);
}

export default GameHeader;
