import Logo from "../../components/Logo/Logo";
import Credit from "../../components/Credit/Credit";
import Sidebar from "./components/Sidebar/Sidebar";
import Identity from "./components/Identity/Identity";
import Bio from "./components/Bio/Bio";
import Counter from "./components/Counter/Counter";
import FriendList from "./components/FriendList/FriendList";
import GamesList from "./components/GamesList/GamesList";
import FavoriteRole from "./components/FavoriteRole/FavoriteRole";


import IconDetective from "../../assets/icons/brand-redhat.svg";

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
		{ id: 2, name: "QueMp4", icon: "🦒", isOnLine: false},
		{ id: 2, name: "QueMp4", icon: "🦒", isOnLine: false},
		{ id: 4, name: "jiraaaaf", icon: "🦒", isOnLine: true},
	];
	return (
		<div className="page">
			<div className="page-header z-100 fixed w-full justify-center border-b py-2 bg-bg-deep/70 border-head-border">
				<Sidebar />
				<div className="text-[1.3rem]">
					<Logo />
				</div>
			</div>
			<main className="page-main pt-25">
				<div className=" md:flex justify-between md:border md:px-4 md:p-3 md:border-card-border-2 md:rounded-xl">
					<Identity username="MasterMind" Since="14/05/2026"/>
					<div className="md:flex md:flex-col">
						<Bio bio="jiraf bleu labla blablabla blablabla blablablabl ablablablablabla blablabla blablabla "/>
						<FavoriteRole role="Detective" icon={IconDetective}/>
					</div>
				</div>

				<Counter games={17} victories={8} winrate={47} friends={3}/>

				<div className="md:gap-3 md:flex">
					<FriendList friends={friends}/>
					<GamesList games={games}/>
				</div>
			</main>
			<Credit />
		</div>
	);
}

export default Profile;
