import "../../style/global.css";
import "./Profile.css";
import Logo from "../../components/Logo/Logo";
import Sidebar from "./components/Sidebar/Sidebar";
import Identity from "./components/Identity/Identity";
import Bio from "./components/Bio/Bio";
import Counter from "./components/Counter/Counter";
function Profile() {
// 	const [user, setUser] = useState({
// 		username: "TinyMontana",
// 		avatar: null,
// 		gamesPlayed: 17,
// 		victories: 8,
// 		friendsCount: 3,
// 	});
//
	const friends = [
		{ id: 1, name: "SuperDario1004" },
		{ id: 2, name: "QueMp4" },
		{ id: 3, name: "MichaelKarate135" },
	];

	// const games = [
	// 	{ id: 1, room: "Room #42 - 6 joueurs", date: "25 mai · Undercover", result: "victoire" },
	// 	{ id: 2, room: "Room #42 - 6 joueurs", date: "26 mai · Undercover", result: "defaite" },
	// 	{ id: 3, room: "Room #42 - 6 joueurs", date: "25 mai · Undercover", result: "victoire" },
	// ];

	return (
		<div className="page">
			<div className="header profile-header">
				<div className="profile-logo">
					<Logo />
				</div>
			</div>
			<Sidebar />
			<main className="profile-main">
				<Identity username="MasterMind" Since="14/05/2026"/>
				<Bio bio="jiraf bleu labla blablabla blablabla blablablabl ablablablablabla blablabla blablabla "/>
				<Counter games={17} victories={8} winrate={47} friends={3}/>
				<FriendList friends={friends}/>
			</main>
		</div>
	);
}

export default Profile;
