import Logo from "@/components/Logo/Logo";
import LinkProfile from "@/components/LinkProfile/LinkProfile";
import FriendsMenuButton from "@/components/FriendsMenu/FriendsMenuButton";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import { useAuth } from "@/context/useAuth";
import { useTranslation } from "react-i18next";

interface HeaderProps {
	compact?: boolean;
}

function Header({ compact }: HeaderProps) {
	const { profile, isAuth, isGuest } = useAuth();
	const { t } = useTranslation();

	return (
		<header className={`page-header relative ${compact ? "py-3! md:py-3!" : ""}`}>
			<div className="flex items-center gap-4">
				{isAuth && !isGuest && <FriendsMenuButton />}
				<Logo />
			</div>
			<div className="flex items-center gap-4">
				<LanguageSwitcher />
				<LinkProfile name={profile?.name ? profile.name : t("auth.guest")} icon="🥷" />
			</div>
		</header>
	);
}

export default Header;
