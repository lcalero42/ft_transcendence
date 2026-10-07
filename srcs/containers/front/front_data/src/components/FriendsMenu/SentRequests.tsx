import { useFriends } from "@/context/useFriends";
import { useTranslation } from "react-i18next";
import RequestSection from "./RequestSection";
import RequestRow from "./RequestRow";

function SentRequests() {
	const { outgoingRequests, cancelRequest } = useFriends();
	const { t } = useTranslation();

	return (
		<RequestSection label={t("friends.sentRequests")} count={outgoingRequests.length}>
			{outgoingRequests.map((request) => (
				<RequestRow key={request.id} avatarUrl={request.addressee.avatarUrl} name={request.addressee.name}>
					<span className="shrink-0 text-xs text-text-dim">{t("friends.pending")}</span>
					<button
						type="button"
						onClick={() => { void cancelRequest(request.id); }}
						className="clean-btn hoverable shrink-0 rounded-lg border border-card-border-2 px-2 py-1 text-xs text-text-dim hover:text-defeat"
					>
						{t("common.cancel")}
					</button>
				</RequestRow>
			))}
		</RequestSection>
	);
}

export default SentRequests;
