import CreateRoomButton from "./CreateRoomButton/CreateRoomButton";
import RoomCard, { type RoomCardProps } from "./RoomCard/RoomCard";

type DisplayRoomCardsProps = {
	rooms: RoomCardProps[];
};

function DisplayRoomCards({rooms}: DisplayRoomCardsProps) {
	return (
		<section className="flex flex-col gap-5
		md:grid md:grid-cols-3 md:gap-[clamp(15px,2vw,30px)]">
			<CreateRoomButton />
			{rooms.map((room) => (
				<RoomCard key={room.id} {...room} />
			))}
		</section>
	);
}
export default DisplayRoomCards;
