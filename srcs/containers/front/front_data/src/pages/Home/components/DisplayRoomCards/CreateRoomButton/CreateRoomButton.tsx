import { Link } from "react-router-dom";

function CreateRoomButton() {
	 return (
		<Link to="/create-room"
		className="card flex
				flex-row
				py-6
				items-center
				justify-center
				border-[1.5px]
				border-dashed
				border-card-accent-border">
			<h3 className="text-outline font-bold m-0 ">Create Room</h3>
			<span className="circle-purple w-7 h-7">+</span>
		</Link>

  );
}

export default CreateRoomButton;
