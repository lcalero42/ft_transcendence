import DisplayRoomCards from "./components/DisplayRoomCards/DisplayRoomCards";
import Logo from "../../components/Logo/Logo";
import Title from "../../components/Title/Title";
import LinkProfile from "../../components/LinkProfile/LinkProfile";
import Credit from "../../components/Credit/Credit";
import FeatureHighlights from "./components/FeatureHighlights/FeatureHighlights";
import AvailableRooms from "./components/AvailableRooms";
import { useEffect, useState } from 'react';
import { fetchRooms, type Room } from '../../api/rooms';
import { getMe, type Player}  from '../../api/player';
import { useAuth } from "@/context/useAuth";

function Home() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
	const {isAuth} = useAuth();
	const [username, setUsername] = useState<string | null>(null);

    // Runs once when the component first mounts — the initial load

	useEffect(() => {
        let ignore = false;

		async function getUsername() {
				if (isAuth) {
					const player: Player = await getMe();
					setUsername(player.name);
				}
				else {
					setUsername(null);
				}
		}
        async function loadRooms() {
            try {
                setLoading(true);
                const data = await fetchRooms();
                if (!ignore) {
                    setRooms(data);
                }
            } catch (err) {
                console.error(err);
                if (!ignore) {
                    setError('Could not load rooms');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }
        loadRooms();
		getUsername();
        return () => {
            ignore = true;
        };
    }, [isAuth]);

    if (loading) return <p>Loading rooms...</p>;
    if (error) return <p>{error}</p>;

	return (
		<div className="page">
			<header className="page-header">
				<Logo />
				<LinkProfile
				name={username ? username : "login"} icon="🥷" />
			</header>

			<main className="page-main">
					<Title />
				<h5 className="mb-6
					md:text-left
					font-semibold"
					style={{color: "var(--color-gray-low)"}}>
						Join a game and unmask the impostors.
				</h5>
				<AvailableRooms />
				<DisplayRoomCards rooms={rooms} />

				<FeatureHighlights />
			</main>

			<Credit />
		</div>
  );
}

export default Home;
