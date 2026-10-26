import type { ReactNode } from "react";
import FriendsMenu from "@/components/FriendsMenu/FriendsMenu";
import ShootingStars from "@/components/ShootingStars/ShootingStars";

function Layout({ children }: { children: ReactNode }) {
	return (
		<>
			<ShootingStars />
			<FriendsMenu />
			{children}
		</>
	);
}

export default Layout;
