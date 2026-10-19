import GoogleIcon from "../../assets/icons/google.svg";
import DiscordIcon from "../../assets/icons/discord.svg";

const providers = [
	{ name: "google", label: "Google", icon: GoogleIcon },
	{ name: "discord", label: "Discord", icon: DiscordIcon },
];

// Plain links, not fetch: the whole page must navigate to the provider's
// login screen, then come back through the backend callback.
function SocialLogin() {
	return (
		<div className="flex justify-center gap-4">
			{providers.map((provider) => (
				<a
					key={provider.name}
					href={`${import.meta.env.VITE_API_URL}/auth/${provider.name}`}
					aria-label={provider.label}
					className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-card-border hover:border-accent-purple"
				>
					<div
						className="mask-icon h-5 w-5 bg-accent-purple"
						style={{
							WebkitMaskImage: `url("${provider.icon}")`,
							maskImage: `url("${provider.icon}")`,
						}}
					/>
				</a>
			))}
		</div>
	);
}

export default SocialLogin;
