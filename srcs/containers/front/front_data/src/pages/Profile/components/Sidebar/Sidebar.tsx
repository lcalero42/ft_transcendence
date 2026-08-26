import { NavLink, useNavigate} from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/useAuth";

interface SidebarLinkItem {
	label: string;
	path: string;
}

const links: SidebarLinkItem[] = [
	{ label: "Home", path: "/home" },
	{ label: "Profile", path: "/profile" },
	{ label: "Stats", path: "/stats" },
	{ label: "Rooms", path: "/gamesRoom" },
	{ label: "Friends", path: "/friends" },
];

function Sidebar() {
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const toggleMenu = () => setIsMenuOpen((prev) => !prev);
	const closeMenu = () => setIsMenuOpen(false);
  	const { logout } = useAuth();
	const navigate = useNavigate();

	function handleLogout() {
    	logout();
    	closeMenu();
    	void navigate("/login");
  	}

	return (
		<div className="group relative z-100">
			<div className="z-101 fixed top-5 left-6">
				<button
					className="flex flex-col justify-between clean-btn w-7 h-5"
					onClick={toggleMenu}
					aria-label="Open the menu"
					aria-expanded={isMenuOpen}
					>
					{[0,1,2].map((i) => (
					<span key={i} className="w-full h-0.5 bg-white rounded-full" />
					))}
				</button>
			</div>
			<aside className={`fixed inset-y-0 left-0
			bg-card/65 hoverable transition-transform p-8 pt-20
			md:w-[clamp(110px,16vw,280px)]
			md:group-hover:translate-x-0
				 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>

				<nav className="flex flex-col gap-5">
					{links.map((link) => (
						<NavLink
							key={link.path}
							to={link.path}
							onClick={closeMenu}
							className={({isActive}) =>
								`flex items-center clean-link font-medium hoverable hover:text-white
							${isActive ? "text-gold" : "text-text-dim"}`
							}
						>
							{link.label}
						</NavLink>
					))}
					<button
          				onClick={handleLogout}
          				className="flex items-center clean-link font-medium hoverable hover:text-white text-text-dim text-left"
          			>
          				Logout
          			</button>
				</nav>
			</aside>
		</div>
	);
}

export default Sidebar;
