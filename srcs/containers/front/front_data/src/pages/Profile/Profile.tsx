import Logo from "../../components/Logo/Logo";
import Sidebar from "./components/Sidebar/Sidebar";
import Identity from "./components/Identity/Identity";
import Bio from "./components/Bio/Bio";
import Counter from "./components/Counter/Counter";
import FriendList from "./components/FriendList/FriendList";
import GamesList from "./components/GamesList/GamesList";



function Profile() {

	const games = [
		{ id: 1, name: "Room #42", nbPlayers: 5, date: "2026-07-25T14:30:00Z", victory: true },
		{ id: 2, name: "giga boss Room", nbPlayers: 6, date: "2026-02-25T14:30:00Z", victory: false },
		{ id: 3, name: "Room #42", nbPlayers: 2, date: "2026-07-25T14:30:00Z", victory : true },
	];

	const friends = [
		{ id: 1, name: "bob", icon: "🤠​", isOnLine: true},
		{ id: 2, name: "QueMp4", icon: "🦒", isOnLine: false},
		{ id: 3, name: "MichaelKarate135", icon: "🦒", isOnLine: true},
		{ id: 4, name: "jiraaaaf", icon: "🦒", isOnLine: true},
	];
	return (
		<div className="page">
			<div className="page-header z-100 fixed top-0 left-0 right-0 justify-center border-b py-2 bg-bg-deep border-head-border">
				<div className="text-[1.3rem] md:hidden">
					<Logo />
				</div>
			</div>
			<Sidebar />
			<main className="page-main pt-18">
				<Identity username="MasterMind" Since="14/05/2026"/>
				<Bio bio="jiraf bleu labla blablabla blablabla blablablabl ablablablablabla blablabla blablabla "/>
				<Counter games={17} victories={8} winrate={47} friends={3}/>
				<FriendList friends={friends}/>
				<GamesList games={games}/>
			</main>
		</div>
	);
}

export default Profile;
