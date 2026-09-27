import DisplayRoomCards from "./components/DisplayRoomCards/DisplayRoomCards";
import Title from "../../components/Title/Title";
import Credit from "../../components/Credit/Credit";
import FeatureHighlights from "./components/FeatureHighlights/FeatureHighlights";
import AvailableRooms from "./components/AvailableRooms";
import { useEffect, useState } from 'react';
import { fetchRooms, type Room } from '../../api/rooms';
import Header from "@/components/Header/Header";
import { Spinner } from "@/components/ui/spinner";
import LoadingDots from "@/components/LoadingDots/LoadingDots";
import ErrorPage from "@/components/ErrorPage/ErrorPage";

function Home() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Runs once when the component first mounts — the initial load

	useEffect(() => {
        let ignore = false;

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
        void loadRooms();
        return () => {
            ignore = true;
        };
    }, []);

    if (loading) return (
		<div className="page flex flex-col items-center justify-center gap-4 py-20">
			<Spinner className="size-10 text-accent-hover" />
			<p className="text-accent-hover font-bold">
				Loading rooms <LoadingDots />
			</p>
		</div>
	);
    if (error) {
		return <ErrorPage error={error} />;
	}

	return (
		<div className="page">
			<Header />

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
