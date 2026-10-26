import { Link } from "react-router-dom";
import GithubIcon from "../../assets/icons/github.svg";

function Credit() {
	return (
		<footer className="flex flex-col items-center gap-1
		mb-3
		text-[0.7em]
		text-text-dim">
			<div className="flex items-center gap-2">
				<Link to="/privacy" className="hover:underline hover:text-accent-purple">
					Privacy Policy
				</Link>
				<span>|</span>
				<a
					href="https://github.com/lcalero42/ft_transcendence"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1 hover:underline hover:text-accent-purple"
				>
					<span
						className="mask-icon h-3 w-3 bg-current"
						style={{
							WebkitMaskImage: `url("${GithubIcon}")`,
							maskImage: `url("${GithubIcon}")`,
						}}
					/>
					GitHub
				</a>
			</div>
			<p>2026 Undercover - by alarroye, ekeisler, lcalero, thmaitre | 42</p>
		</footer>
	);
}

export default Credit;
