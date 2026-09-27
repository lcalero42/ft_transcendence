import { useFriends } from "@/context/useFriends";
import { getAvatarUrl } from "@/api/player";

function SentRequests() {
	const { outgoingRequests, cancelRequest } = useFriends();

	if (outgoingRequests.length === 0) return null;

	return (
		<div>
			<div className="mb-2 font-semibold text-accent-purple">
				sent requests ({outgoingRequests.length})
			</div>
			<div className="flex flex-col gap-2">
				{outgoingRequests.map((request) => (
					<div
						key={request.id}
						className="flex items-center gap-3 rounded-xl bg-card px-4 py-2"
					>
						<img
							src={getAvatarUrl(request.addressee.avatarUrl)}
							alt=""
							className="h-9 w-9 shrink-0 rounded-full object-cover"
						/>
						<div className="flex-1 truncate text-sm font-medium">
							{request.addressee.name}
						</div>
						<span className="shrink-0 text-xs text-text-dim">pending</span>
						<button
							type="button"
							onClick={() => { void cancelRequest(request.id); }}
							className="clean-btn hoverable shrink-0 rounded-lg border border-card-border-2 px-2 py-1 text-xs text-text-dim hover:text-defeat"
						>
							Cancel
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

export default SentRequests;
