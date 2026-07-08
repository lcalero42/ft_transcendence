import "./Home.css";
import RoomCard from "./components/RoomCard/RoomCard";
import CreateRoomButton from "./components/CreateRoomButton/CreateRoomButton";
import Logo from "../../components/Logo/Logo";
import Title from "../../components/Title/Title";
import LinkProfile from "../../components/LinkProfile/LinkProfile";
import { useState } from 'react';

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
		        <h5 className="subtitle">jiraaaaaaaaaaaaafffffffffffffffffffffffffff=)</h5>

				<CreateRoomButton />
				<section className="room-list">
					{rooms.map((room) => (
						<RoomCard key={room.id} {...room} />
					))}
				</section>
			</main>
		 </div>
  );
}

export default Home;
