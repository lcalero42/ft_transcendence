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
		<header className={`page-header relative items-center gap-3 px-5! sm:px-[10vw]! md:px-[15vw]! ${compact ? "py-3! md:py-3!" : ""}`}>
			<div className="flex min-w-0 items-center gap-3 sm:gap-4">
				{isAuth && !isGuest && <FriendsMenuButton />}
				<Logo className="text-[1.5rem] sm:text-[2rem]" />
			</div>
			<div className="flex shrink-0 items-center gap-3 sm:gap-4">
				<LanguageSwitcher />
				<LinkProfile name={profile?.name ? profile.name : t("auth.guest")} icon="🥷" />
			</div>
		</header>
	);
}

export default Header;
