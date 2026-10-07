import Header from "@/components/Header/Header";
import Credit from "@/components/Credit/Credit";
import Identity from "./components/Identity/Identity";
import Bio from "./components/Bio/Bio";
import Counter from "./components/Counter/Counter";
import FriendList from "./components/FriendList/FriendList";
import GamesList from "./components/GamesList/GamesList";
import FavoriteRole from "./components/FavoriteRole/FavoriteRole";
import IconDetective from "../../assets/icons/brand-redhat.svg";
import AvatarDefault from "../../assets/profile-photo/avatar-default.svg";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { useFriends } from "@/context/useFriends";
import { useFriendPlayers } from "@/context/useFriendPlayers";
import { LogOut } from "lucide-react";
import LoadPage from "@/components/LoadPage/LoadPage";
import ErrorPage from "@/components/ErrorPage/ErrorPage";
import {
	getMe,
	getAvatarUrl,
	getCountGamesPlayed,
	getCountVictory,
	getWinRate,
	getGamesList,
	type Player,
	type GameListOfPlayer
}  from '../../api/player';
import { clearToken } from "@/api/auth/client";
import { useNavigate } from "react-router-dom";

function Profile() {
	const { user } = useAuth();
	const { logout } = useAuth();
	function handleLogout() {
    	logout();
    	void navigate("/login");
  	}
	const [player, setPlayer] = useState<Player | null>(null);
	const [gamesPlayed, setGamesPlayed] = useState<number>(0);
	const [victory, setVictory] = useState<number>(0);
	const [winrate, setWinrate] = useState<number>(0);
	const [gameList, setGamesList] = useState<GameListOfPlayer[]>([]);

	const [loading, setLoading] = useState(true);
  	const [error, setError] = useState<string | null>(null);
  	const navigate = useNavigate();
	const { friendsStatus, retryFriends } = useFriends();
	const friends = useFriendPlayers();
	useEffect(() => {
		if (!user) return;
		const cpUser = user;
		async function loadData() {
			try {
				const [me, games, victories, winrate, gameslist] = await Promise.all([
					getMe(),
					getCountGamesPlayed(cpUser.id),
					getCountVictory(cpUser.id),
					getWinRate(cpUser.id),
					getGamesList(cpUser.id),
				])
				setPlayer(me);
				setGamesPlayed(games);
				setVictory(victories);
				setWinrate(winrate);
				setGamesList(gameslist);
		  	} catch (err) {
				console.error("Profile load error:", err); //debug
				setError("Error when loading the player");
				clearToken();
				void navigate("/login", { replace: true });
		  	} finally {
				setLoading(false);
		  	}
		}

		void loadData();
	},[user, navigate]);
	if (!user) return null;
    if (loading) return <LoadPage />;
    if (error) return <ErrorPage error={error} />;
  	if (!player) return null;

	const avatarUrl = getAvatarUrl(player.avatarUrl) ?? AvatarDefault;
	return (
		<div className="page">
			<div className="z-100 fixed w-full border-b py-2 bg-bg-deep/70 border-head-border">
				<Header compact />
			</div>
			<main className="page-main pt-25">
				<div className=" md:flex justify-between md:border md:px-4 md:p-3 md:border-card-border-2 md:rounded-xl">
					<Identity
						playerId={user.id}
						username={player.name}
						Since={(new Date(player.createdAt)).toLocaleDateString("fr-FR")}
						urlAvatar={avatarUrl}
					/>
					<div className="md:flex md:flex-col">
						<Bio
							playerId={user.id}
							bio={player.aboutMe ? player.aboutMe : "not description"}
						/>
						<FavoriteRole role="Detective" icon={IconDetective}/>
					</div>
				</div>

				<Counter
					games={gamesPlayed}
					victories={victory}
					winrate={Number(winrate.toFixed(2))}
					friends={friends.length}
				/>

				<div className="md:gap-3 md:flex">
					<FriendList friends={friends} status={friendsStatus} onRetry={retryFriends}/>
					<GamesList games={gameList}/>
				</div>
				<button
				    onClick={handleLogout}
				    className="mt-3 ml-auto flex items-center gap-2 rounded-xl border border-card-border bg-card px-4 py-2 text-sm font-medium text-gray-high transition-colors duration-150 hover:border-defeat hover:text-defeat"
				>
				    <LogOut size={16} />
				    Logout
				</button>
			</main>
			<Credit />
		</div>
	);
}

export default Profile;
