import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { FriendsStatus } from "@/context/friends-context";

type InviteFriendProps = {
	id: number;
	name: string;
	avatarUrl: string;
	inRoom: boolean;
};

type InviteFriendListProps = {
	friends: InviteFriendProps[];
	status: FriendsStatus;
	onRetry: () => void;
	disabled: boolean;
	onInvite: (friendId: number) => void;
};

function InviteFriendList({ friends, status, onRetry, disabled, onInvite }: InviteFriendListProps) {
	const { t } = useTranslation();

	return (
		<div className="card md:bg-transparent md:w-[80%] border border-card-border-2">
			<div className="flex justify-between mb-3">
				<div className="flex gap-1">
					<div className="font-bold"> {t("profile.myFriends")} </div>
					{status === "ready" && <span> ({friends.length}) </span>}
				</div>
			</div>
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
				<p className="text-sm text-text-dim">{t("lobby.noFriendsOnline")}</p>
			)}
			{status === "ready" && friends.length > 0 && (
				<div className="flex flex-col gap-5 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
					{friends.map((f) => (
						<div className="flex items-center text-left gap-4" key={f.id}>
							<img
								src={f.avatarUrl}
								alt={f.name}
								className="w-8 h-8 rounded-full object-cover shrink-0"
							/>
							<div className="flex flex-col text-left flex-1 min-w-0">
								<div className="text-sm font-semibold truncate">{f.name}</div>
								<div className="flex items-center gap-1.5 text-xs text-text-dim">
									<span className="w-2 h-2 rounded-full bg-victory" />
									{t("common.online")}
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								disabled={f.inRoom || disabled}
								onClick={() => onInvite(f.id)}
							>
								{f.inRoom ? t("lobby.inRoom") : t("lobby.invite")}
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default InviteFriendList;
