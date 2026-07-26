import { Link } from "react-router-dom";

function CreateRoomButton() {
	 return (
		<Link to="/create-room" className="create-room-card">
      		<h3 className="create-room-label">Create Room</h3>
			<span className="create-room-plus">+</span>
		</Link>

  );
}

export default CreateRoomButton;

