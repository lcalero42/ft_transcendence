import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

type InviteFriendProps = {
	id: number;
	name: string;
	avatarUrl: string;
	inRoom: boolean;
};

type InviteFriendListProps = {
	friends: InviteFriendProps[];
	disabled: boolean;
	onInvite: (friendId: number) => void;
};

function InviteFriendList({ friends, disabled, onInvite }: InviteFriendListProps) {
	const { t } = useTranslation();

	return (
		<div className="card md:bg-transparent md:w-[80%] border border-card-border-2">
			<div className="flex justify-between mb-3">
				<div className="flex gap-1">
					<div className="font-bold"> {t("profile.myFriends")} </div>
					<span> ({friends.length}) </span>
				</div>
			</div>
			{friends.length === 0 ? (
				<p className="text-sm text-text-dim">{t("lobby.noFriendsOnline")}</p>
			) : (
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
