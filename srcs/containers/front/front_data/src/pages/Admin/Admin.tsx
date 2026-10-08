import Sidebar from "@/components/Sidebar/Sidebar";
import Logo from "@/components/Logo/Logo";
import CountCards from "./components/CountCards";
import PlayerList from "./components/PlayerList";
import RoomList from "./components/RoomList";
import WordPairList from "./components/WordPairList";
import Credit from "@/components/Credit/Credit";
import { Toaster } from "@/components/ui/toast";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from "react-i18next";

function Admin() {
	const { t } = useTranslation();

	return (
		<div className="page">
			<div className="page-header z-100 fixed w-full justify-center border-b py-2 bg-bg-deep/70 border-head-border">
				<Sidebar />
				<div className="text-[1.3rem]">
					<Logo />
				</div>
				<LanguageSwitcher className="absolute top-1/2 right-6 -translate-y-1/2" />
			</div>
			<main className="page-main pt-20">
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
