import { Link } from "react-router-dom";

function Logo({ className = "text-[2rem]" }: { className?: string }) {
	return (
		<Link to="/home" className={`font-["UnifrakturMaguntia"] ${className}`}>
			UnderCover
		</Link>
	);
}

export default Logo;
