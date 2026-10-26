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
	getPublicProfile,
	getAvatarUrl,
	getCountGamesPlayed,
	getCountVictory,
	getWinRate,
	getGamesList,
	type PublicProfile,
	type GameListOfPlayer
}  from '../../api/player';
import * as authApi from "@/api/auth/auth";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Profile() {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const { logout } = useAuth();
	function handleLogout() {
    	void logout().then(() => navigate("/login"));
  	}
	const { name } = useParams();
	const [player, setPlayer] = useState<PublicProfile | null>(null);
	const [gamesPlayed, setGamesPlayed] = useState<number>(0);
	const [victory, setVictory] = useState<number>(0);
	const [winrate, setWinrate] = useState<number>(0);
	const [gameList, setGamesList] = useState<GameListOfPlayer[]>([]);

	const [loading, setLoading] = useState(true);
  	const [error, setError] = useState(false);
  	const navigate = useNavigate();
	const { friendsStatus, retryFriends } = useFriends();
	const friends = useFriendPlayers();
	useEffect(() => {
		if (!user) return;
		async function loadData() {
			try {
				const profile = name ? await getPublicProfile(name) : await getMe();
				const [games, victories, winrate, gameslist] = await Promise.all([
					getCountGamesPlayed(profile.id),
					getCountVictory(profile.id),
					getWinRate(profile.id),
					getGamesList(profile.id),
				])
				setPlayer(profile);
				setGamesPlayed(games);
				setVictory(victories);
				setWinrate(winrate);
				setGamesList(gameslist);
		  	} catch (err) {
				console.error("Profile load error:", err); //debug
				setError(true);
				if (!name) {
					await authApi.logout();
					void navigate("/login", { replace: true });
				}
		  	} finally {
				setLoading(false);
		  	}
		}

		void loadData();
	},[user, name, navigate]);
	if (!user) return null;
    if (loading) return <LoadPage />;
    if (error) return <ErrorPage error={t("profile.loadError")} />;
  	if (!player) return null;
	const isOwn = player.id === user.id;

	const avatarUrl = getAvatarUrl(player.avatarUrl) ?? AvatarDefault;
	return (
		<div className="page">
			<div className="z-100 sticky top-0 w-full border-b py-2 bg-bg-deep/70 border-head-border">
				<Header compact />
			</div>
			<main className="page-main pt-3">
				<div className=" md:flex justify-between md:border md:px-4 md:p-3 md:border-card-border-2 md:rounded-xl">
					<Identity
						playerId={player.id}
						username={player.name}
						Since={(new Date(player.createdAt)).toLocaleDateString(i18n.language)}
						urlAvatar={avatarUrl}
						editable={isOwn}
					/>
					<div className="md:flex md:flex-col">
						<Bio
							playerId={player.id}
							bio={player.aboutMe ?? ""}
							editable={isOwn}
						/>
						<FavoriteRole role={t("profile.detective")} icon={IconDetective}/>
					</div>
				</div>

				<Counter
					games={gamesPlayed}
					victories={victory}
					winrate={Number(winrate.toFixed(2))}
					friends={friends.length}
				/>

				<div className="md:gap-3 md:flex">
					{isOwn && <FriendList friends={friends} status={friendsStatus} onRetry={retryFriends}/>}
					<GamesList games={gameList}/>
				</div>
				{isOwn && <button
				    onClick={handleLogout}
				    className="mt-3 ml-auto flex items-center gap-2 rounded-xl border border-card-border bg-card px-4 py-2 text-sm font-medium text-gray-high transition-colors duration-150 hover:border-defeat hover:text-defeat"
				>
				    <LogOut size={16} />
				    {t("common.logout")}
				</button>}
			</main>
			<Credit />
		</div>
	);
}

export default Profile;
