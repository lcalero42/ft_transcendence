import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import Logo from "../../../../components/Logo/Logo";

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
	return (
		<div className="group relative z-100">
			<div className="sidebar-topbar">
				<button
					className="burger-btn"
					onClick={toggleMenu}
					aria-label="Open the menu"
					aria-expanded={isMenuOpen}
					>
					<span className="burger-line" />
					<span className="burger-line" />
					<span className="burger-line" />
				</button>

				<div className="sidebar-logo">
					<Logo />
				</div>
			</div>
			<aside className={`sidebar-drawer ${isMenuOpen ? "sidebar-drawer--open" : ""}`}>
				<nav className={`sidebar-nav ${isMenuOpen ? "sidebar-nav--open" : ""}`}>
					{links.map((link) => (
						<NavLink
							key={link.path}
							to={link.path}
							onClick={closeMenu}
							className={({isActive}) =>
								`sidebar-link ${isActive ? "sidebar-link--active" : ""}`
							}
						>
							{link.label}
						</NavLink>
					))}
				</nav>
			</aside>
		</div>
	);
}

export default Sidebar;
