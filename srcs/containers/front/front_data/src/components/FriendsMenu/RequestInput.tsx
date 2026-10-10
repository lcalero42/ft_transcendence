import { useState } from "react";
import { useFriends } from "@/context/useFriends";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";

function RequestInput() {
	const { sendRequest } = useFriends();
	const { t } = useTranslation();
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed || isSubmitting) return;

		setIsSubmitting(true);
		setError(null);
		try {
			await sendRequest(trimmed);
			toast.add({ type: "success", title: t("friends.requestSentTitle"), description: t("friends.requestSentDescription", { name: trimmed }) });
			setName("");
		} catch (err) {
			setError(err instanceof Error ? err.message : t("common.somethingWentWrong"));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={(e) => { void handleSubmit(e); }}>
			<div className="mb-1 font-semibold text-accent-purple">{t("friends.addFriend")}</div>
			<div className="flex gap-2">
				<input
					className="input"
					placeholder={t("friends.usernamePlaceholder")}
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						setError(null);
					}}
				/>
				<button
					type="submit"
					disabled={isSubmitting}
					className="clean-btn hoverable shrink-0 rounded-lg bg-linear-to-r from-btn-gradient-start to-btn-gradient-end px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
				>
					{t("friends.add")}
				</button>
			</div>
			{error && <div className="mt-1 text-sm text-defeat">{error}</div>}
		</form>
	);
}

export default RequestInput;
