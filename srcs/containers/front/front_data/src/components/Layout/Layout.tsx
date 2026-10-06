import type { ReactNode } from "react";
import FriendsMenu from "@/components/FriendsMenu/FriendsMenu";

function Layout({ children }: { children: ReactNode }) {
	return (
		<>
			<FriendsMenu />
			{children}
		</>
	);
}

export default Layout;
