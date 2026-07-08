import { useParams } from "react-router-dom";

function GameRoom() {
	const {id} = useParams();

	return (
		<div className="page">
			<h1> its a {id} partiiiii</h1>
		</div>
	);
}

export default GameRoom;
