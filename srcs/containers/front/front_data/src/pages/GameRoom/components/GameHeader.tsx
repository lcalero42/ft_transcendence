import Logo from "@/components/Logo/Logo";
import LinkProfile from "@/components/LinkProfile/LinkProfile";
import { useAuth } from "@/context/useAuth";

function GameHeader() {
	const { profile } = useAuth();

	return (
		<header className="page-header">
			<Logo />
			<LinkProfile name={profile?.name ? profile.name : "login"} icon="🥷" />
		</header>
	);
}

export default GameHeader;
