import CreateRoomButton from "./CreateRoomButton/CreateRoomButton";
import RoomCard, { type RoomCardProps } from "./RoomCard/RoomCard";

type DisplayRoomCardsProps = {
	rooms: RoomCardProps[];
};

function DisplayRoomCards({rooms}: DisplayRoomCardsProps) {
	return (
		<section className="room-list">
			<CreateRoomButton />
			{rooms.map((room) => (
				<RoomCard key={room.id} {...room} />
			))}
		</section>
	);
}
export default DisplayRoomCards;
