import "./Home.css";
import CreateRoomButton from "./components/CreateRoomButton/CreateRoomButton";
import DisplayRoomCards from "./components/DisplayRoomCards/DisplayRoomCards";
import Logo from "../../components/Logo/Logo";
import Title from "../../components/Title/Title";
import LinkProfile from "../../components/LinkProfile/LinkProfile";
import { useState } from 'react';
import Credit from "../../components/Credit/Credit";

function Home() {
	const rooms = [
		    { id: 1, name: "GigaBoss Roommmmmmmmmmmmmmmmmmmmmmmmmmmmm", players: 5},
		    { id: 2, name: "jiraf Room", players: 4},
		    { id: 3, name: "jiji ", players: 6},
		    { id: 4, name: "jiji ", players: 6},
		    { id: 5, name: "jiji ", players: 6},
		    { id: 6, name: "jiji ", players: 6},
		];
		const [userName, setUsername] = useState("audrna");

	return (
		<div className="page">
			<header className="header">
				<Logo />
				<LinkProfile name={userName} />
			</header>

			<main className="main">
				<Title />

				<h5 className="subtitle"> Rejoignez une partie et démasquez les imposteurs.</h5>

				<CreateRoomButton />

				<DisplayRoomCards rooms={rooms} />

				<Credit />
			</main>
		 </div>
  );
}

export default Home;
