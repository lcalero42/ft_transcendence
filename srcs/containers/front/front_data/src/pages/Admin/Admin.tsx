import Header from "@/components/Header/Header";
import CountCards from "./components/CountCards";
import PlayerList from "./components/PlayerList";
import RoomList from "./components/RoomList";
import WordPairList from "./components/WordPairList";
import Credit from "@/components/Credit/Credit";
import { Toaster } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";

function Admin() {
	const { t } = useTranslation();

	return (
		<div className="page">
			<div className="z-100 fixed w-full border-b py-2 bg-bg-deep/70 border-head-border">
				<Header compact />
			</div>
			<main className="page-main pt-25">
				<div className=" text-left text-xl font-black pb-4"> {t("admin.title")}</div>
				<CountCards />
				<PlayerList />
				<RoomList />
				<WordPairList />
			</main>
			<Credit />
			<Toaster />

		</div>
	);
}

export default Admin;
