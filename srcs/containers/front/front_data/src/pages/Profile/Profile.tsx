import "./Profile.css";
import Sidebar from "./components/Sidebar/Sidebar";
import { useState } from "react";
import Logo from "../../components/Logo/Logo";

function Profile() {
	const [user, setUser] = useState({
		username: "TinyMontana",
		avatar: null,
		gamesPlayed: 17,
		victories: 8,
		friendsCount: 3,
	});

	const friends = [
		{ id: 1, name: "SuperDario1004" },
		{ id: 2, name: "QueMp4" },
		{ id: 3, name: "MichaelKarate135" },
	];

	const games = [
		{ id: 1, room: "Room #42 - 6 joueurs", date: "25 mai · Undercover", result: "victoire" },
		{ id: 2, room: "Room #42 - 6 joueurs", date: "26 mai · Undercover", result: "defaite" },
		{ id: 3, room: "Room #42 - 6 joueurs", date: "25 mai · Undercover", result: "victoire" },
	];

	return (
		<div className="page">
			<div className="profile-logo">
				<Logo />
			</div>

			<Sidebar />

		
		</div>
	);
}

export default Profile;

	// <main className="profile-main">
	// 			<h2 className="profile-title">Tableau de bord</h2>

	// 			<div className="stats-row">
	// 				<StatCard value={user.gamesPlayed} label="Partie jouées" />
	// 				<StatCard value={user.victories} label="victoires" />
	// 				<StatCard value={user.friendsCount} label="Amis" />
	// 			</div>

	// 			<UserCard username={user.username} avatar={user.avatar} />

	// 			<FriendsList friends={friends} />

	// 			<GameHistory games={games} />

	// 			<button className="logout-btn">se deconnecter</button>
			// </main>