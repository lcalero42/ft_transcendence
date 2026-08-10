import GoogleIcon from "../../../../assets/icons/google.svg";
import DiscordIcon from "../../../../assets/icons/discord.svg";
import FortyTwoIcon from "../../../../assets/icons/42.svg";

const providers = [
	{ name: "google", icon: GoogleIcon },
	{ name: "discord", icon: DiscordIcon },
	{ name: "42", icon: FortyTwoIcon },
];

function SocialLogin() {
	return (
		<div className="flex justify-center gap-4">
			{providers.map((provider) => (
				<button
					key={provider.name}
					type="button"
					className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-card-border hover:border-accent-purple"
				>
					<div
						className="mask-icon h-5 w-5 bg-accent-purple"
						style={{
							WebkitMaskImage: `url("${provider.icon}")`,
							maskImage: `url("${provider.icon}")`,
						}}
					/>
				</button>
			))}
		</div>
	);
}

export default SocialLogin;
