import "./CreateRoomButton.css"
import { Link } from "react-router-dom";

function CreateRoomButton() {
	 return (
		<Link to={`/create-room`} className="create-room-card">
      		<h3 className="label">Create Room</h3>
		</Link>

  );
}

export default CreateRoomButton;
