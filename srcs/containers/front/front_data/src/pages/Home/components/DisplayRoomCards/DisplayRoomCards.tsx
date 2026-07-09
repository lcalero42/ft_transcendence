import "./RoomCard/RoomCard.css";
import RoomCard, { type RoomCardProps } from "./RoomCard/RoomCard";

type DisplayRoomCardsProps = {
	rooms: RoomCardProps[];
};

function DisplayRoomCards({rooms}: DisplayRoomCardsProps) {
	return (
		<section className="room-list">
			{rooms.map((room) => (
				<RoomCard key={room. id} {...room} />
			))}
		</section>
	);
}
export default DisplayRoomCards;
