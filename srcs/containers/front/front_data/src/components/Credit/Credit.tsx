import { Link } from "react-router-dom";

function Credit() {
	return (
		<footer className="flex flex-col items-center gap-1
		mb-3
		text-[0.7em]
		text-text-dim">
			<Link to="/privacy" className="hover:underline hover:text-accent-purple">
				Privacy Policy
			</Link>
			<p>2026 Undercover - by alarroye, ekeisler, lcalero, thmaitre | 42</p>
		</footer>
	);
}

export default Credit;
