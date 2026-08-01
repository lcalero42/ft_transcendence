import { Link } from "react-router-dom";

type LinkProfileProps = {
	name: string;
	icon: string;
};

function LinkProfile({name, icon}: LinkProfileProps) {
	return (
		<Link to="/profile" className="badge">
				<span>{icon}</span>
				<span>{name}</span>
		</Link>
	);
}

export default LinkProfile;
