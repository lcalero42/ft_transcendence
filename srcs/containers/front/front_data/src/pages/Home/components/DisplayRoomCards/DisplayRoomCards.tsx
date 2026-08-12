import CreateRoomButton from "./CreateRoomButton/CreateRoomButton";
import RoomCard from "./RoomCard/RoomCard";
import { type Room } from '../../../../api/rooms';

type Rooms = {
    rooms: Room[];
};

function DisplayRoomCards({ rooms }: Rooms) {
    return (
        <section className="flex flex-col
        md:grid md:grid-cols-3 md:gap-[clamp(15px,2vw,30px)]">
            <CreateRoomButton />
            {rooms.map((room) => (
                <RoomCard key={room.id} min_players={room.min_player} max_players={room.max_player} {...room} />
            ))}
        </section>
    );
}
export default DisplayRoomCards;
