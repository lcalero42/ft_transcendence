import { Check, X } from "lucide-react";
import { useFriends } from "@/context/useFriends";
import { useTranslation } from "react-i18next";
import RequestSection from "./RequestSection";
import RequestRow from "./RequestRow";

function PendingRequests() {
	const { incomingRequests, acceptRequest, declineRequest } = useFriends();
	const { t } = useTranslation();

	return (
		<RequestSection label={t("friends.pendingRequests")} count={incomingRequests.length}>
			{incomingRequests.map((request) => (
				<RequestRow key={request.id} avatarUrl={request.requester.avatarUrl} name={request.requester.name}>
					<button
						type="button"
						aria-label={t("friends.accept")}
						onClick={() => { void acceptRequest(request.id); }}
						className="clean-btn hoverable flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-victory text-white"
					>
						<Check size={16} />
					</button>
					<button
						type="button"
						aria-label={t("friends.decline")}
						onClick={() => { void declineRequest(request.id); }}
						className="clean-btn hoverable flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-defeat text-white"
					>
						<X size={16} />
					</button>
				</RequestRow>
			))}
		</RequestSection>
	);
}

export default PendingRequests;
