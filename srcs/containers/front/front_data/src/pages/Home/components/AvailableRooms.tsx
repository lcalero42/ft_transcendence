
import IconGamepad from "../../../assets/icons/gamepad.svg"
import { useTranslation } from "react-i18next";

function AvailableRooms() {
	const { t } = useTranslation();

	return (
		<div className="card flex-row px-0 bg-transparent">
			<div className="circle-purple w-12 h-12">
				<div className="mask-icon w-8 h-8 bg-white"
					style={{
						WebkitMaskImage: `url("${IconGamepad}")`,
						maskImage: `url("${IconGamepad}")`
					}}
				/>
			</div>
			<div className="text-left">
				<h3 className="text-gray-high font-bold text-lg">
					{t("home.availableRooms")}
				</h3>
				<p className="text-gray-low text-xs font-bold">
					{t("home.availableRoomsHint")}
				</p>
			</div>
		</div>
	);
}
export default AvailableRooms;
