import "./LinkProfile.css";
import { Link } from "react-router-dom";

type LinkProfileProps = {
	name: string;
};

function LinkProfile({name}: LinkProfileProps) {
	return (
		<Link to="/profile" className="user-badge">
				{name}
		</Link>
	);
}

export default LinkProfile;
