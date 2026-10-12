import { Link } from "react-router-dom";
import { getAvatarUrl } from "@/api/player";
import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";

type LinkProfileProps = {
	name: string;
	avatarUrl: string | null;
};

function LinkProfile({name, avatarUrl}: LinkProfileProps) {
	return (
		<Link to="/profile" className="badge py-1">
				<span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card-border-2">
					{avatarUrl ? (
						<img className="h-full w-full rounded-full object-cover" src={getAvatarUrl(avatarUrl)} alt="" />
					) : (
						<span className="mask-icon h-4 w-4 bg-text-dim"
							style={{
								WebkitMaskImage: `url(${AvatarDefault})`,
								maskImage: `url("${AvatarDefault}")`,
							}}
						/>
					)}
				</span>
				<span className="hidden sm:inline">{name}</span>
		</Link>
	);
}

export default LinkProfile;
