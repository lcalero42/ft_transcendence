
import IconGamepad from "../../../assets/icons/gamepad.svg"

function AvailableRooms() {
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
					Available Rooms
				</h3>
				<p className="text-gray-low text-xs font-bold">
					Join a room and start playing
				</p>
			</div>
		</div>
	);
}
export default AvailableRooms;
