import DisplayRoomCards from "./components/DisplayRoomCards/DisplayRoomCards";
import Title from "../../components/Title/Title";
import Credit from "../../components/Credit/Credit";
import FeatureHighlights from "./components/FeatureHighlights/FeatureHighlights";
import AvailableRooms from "./components/AvailableRooms";
import { useEffect, useState } from 'react';
import { fetchRooms, type Room } from '../../api/rooms';
import Header from "@/components/Header/Header";
import ErrorPage from "@/components/ErrorPage/ErrorPage";
import LoadPage from "@/components/LoadPage/LoadPage";
import { useTranslation } from "react-i18next";
import { useFriends } from "@/context/useFriends";

function Home() {
    const { t } = useTranslation();
    const { roomsVersion } = useFriends();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);



	useEffect(() => {
        let ignore = false;

        async function loadRooms() {
            try {
                const data = await fetchRooms();
                if (!ignore) {
                    setRooms(data);
                }
            } catch (err) {
                console.error(err);
                if (!ignore) {
                    setError(true);
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
    }, [roomsVersion]);

    if (loading) return <LoadPage />;
    if (error) return <ErrorPage error={t("home.loadError")} />;

	return (
		<div className="page">
			<Header />

			<main className="page-main">
					<Title />
				<h5 className="mb-6
					md:text-left
					font-semibold"
					style={{color: "var(--color-gray-low)"}}>
						{t("home.subtitle")}
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
