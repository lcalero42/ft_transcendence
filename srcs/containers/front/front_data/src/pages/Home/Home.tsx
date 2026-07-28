import DisplayRoomCards from "./components/DisplayRoomCards/DisplayRoomCards";
import Logo from "../../components/Logo/Logo";
import Title from "../../components/Title/Title";
import LinkProfile from "../../components/LinkProfile/LinkProfile";
import Credit from "../../components/Credit/Credit";
import FeatureHighlights from "./components/FeatureHighlights/FeatureHighlights";
import AvailableRooms from "./components/AvailableRooms";
import { useEffect, useState } from 'react';
import { fetchRooms, type Room } from '../../api/rooms';

function Home() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
	const [userName] = useState("audrna");

    // Runs once when the component first mounts — the initial load
    useEffect(() => {
        loadRooms();
    }, []);

    async function loadRooms() {
        try {
        setLoading(true);
        const data = await fetchRooms();
        console.log({data});
        setRooms(data);
        } catch (err) {
        setError('Could not load rooms');
        } finally {
        setLoading(false);
        }
    }

    if (loading) return <p>Loading rooms...</p>;
    if (error) return <p>{error}</p>;

	return (
		<div className="page">
			<header className="page-header">
				<Logo />
				<LinkProfile name={userName} icon="🥷" />
			</header>

			<main className="page-main">
					<Title />
				<h5 className="mb-6
					md:text-left
					font-semibold"
					style={{color: "var(--color-gray-low)"}}>
						Rejoignez une partie et démasquez les imposteurs.
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
