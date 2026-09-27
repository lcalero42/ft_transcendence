import { Check, X } from "lucide-react";
import { useFriends } from "@/context/useFriends";
import { getAvatarUrl } from "@/api/player";

function PendingRequests() {
	const { incomingRequests, acceptRequest, declineRequest } = useFriends();

	if (incomingRequests.length === 0) return null;

	return (
		<div>
			<div className="mb-2 font-semibold text-accent-purple">
				pending requests ({incomingRequests.length})
			</div>
			<div className="flex flex-col gap-2">
				{incomingRequests.map((request) => (
					<div
						key={request.id}
						className="flex items-center gap-3 rounded-xl bg-card px-4 py-2"
					>
						<img
							src={getAvatarUrl(request.requester.avatarUrl)}
							alt=""
							className="h-9 w-9 shrink-0 rounded-full object-cover"
						/>
						<div className="flex-1 truncate text-sm font-medium">
							{request.requester.name}
						</div>
						<button
							type="button"
							aria-label="Accept"
							onClick={() => { void acceptRequest(request.id); }}
							className="clean-btn hoverable flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-victory text-white"
						>
							<Check size={16} />
						</button>
						<button
							type="button"
							aria-label="Decline"
							onClick={() => { void declineRequest(request.id); }}
							className="clean-btn hoverable flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-defeat text-white"
						>
							<X size={16} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

export default PendingRequests;
