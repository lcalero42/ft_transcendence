import { getAvatarUrl } from "@/api/player";
import { Spinner } from "@/components/ui/spinner";
import type { FriendsStatus } from "@/context/friends-context";
import { useTranslation } from "react-i18next";

type FriendProps = {
	id: number;
	name: string;
	avatarUrl: string | null;
	isOnline: boolean;
};

type FriendListProps = {
	friends: FriendProps[];
	status: FriendsStatus;
	onRetry: () => void;
};

function FriendList({friends, status, onRetry}: FriendListProps) {
	const { t } = useTranslation();
	return (
		<div className="card bg-transparent md:w-[80%] border border-card-border-2">
			<div className="flex justify-between mb-3">
				<div className="flex gap-1">
					<div className="font-bold"> {t("profile.myFriends")} </div>
					{status === "ready" && <span> ({friends.length}) </span>}
				</div>
			</div>
			<div className="flex flex-col gap-5 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{status === "loading" && (
					<div className="flex justify-center py-4">
						<Spinner className="size-6 text-accent-hover" />
					</div>
				)}
				{status === "error" && (
					<div className="flex flex-col items-center gap-2 text-sm">
						<p className="text-defeat font-semibold">{t("friends.loadError")}</p>
						<button
							type="button"
							onClick={onRetry}
							className="clean-btn hoverable rounded-lg border border-card-border-2 px-3 py-1 text-xs text-text-dim hover:text-defeat"
						>
							{t("common.retry")}
						</button>
					</div>
				)}
				{status === "ready" && friends.length === 0 && (
					<div className="text-sm text-text-dim">{t("friends.none")}</div>
				)}
				{status === "ready" && friends.map((f) => (
					<div className={`flex items-center text-left gap-4
					`}
					key={f.id}>
						<img
							src={getAvatarUrl(f.avatarUrl)}
							alt=""
							className="h-9 w-9 shrink-0 rounded-full object-cover"
						/>
						<div className="flex flex-col text-left">
							<div className="text-sm font-semibold hoverable hover:font-bold">{f.name}</div>
							<div className="flex items-center gap-1.5 text-xs text-text-dim">
								 <span
								 	className={`w-2 h-2 rounded-full
										${f.isOnline ? "bg-victory" : "bg-text-dim"}`}
								/>
								{f.isOnline ? t("common.online") : t("common.offline")}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default FriendList;
