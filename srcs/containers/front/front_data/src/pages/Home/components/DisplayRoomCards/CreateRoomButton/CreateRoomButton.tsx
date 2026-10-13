import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DashedOrbit } from "@/components/ui/dashed-orbit";

function CreateRoomButton() {
	const { t } = useTranslation();

	return (
		<Link
			to="/create-room"
			className="group card flex-row items-center justify-center py-6 border-[1.5px] dashed-orbit"
		>
			<DashedOrbit />
			<h3 className="text-outline font-bold m-0">{t("home.createRoom")}</h3>
			<span className="circle-purple w-7 h-7 transition-[rotate] duration-300 ease-out motion-safe:group-hover:rotate-90 motion-safe:group-focus-visible:rotate-90">
				+
			</span>
		</Link>
	);
}

export default CreateRoomButton;
