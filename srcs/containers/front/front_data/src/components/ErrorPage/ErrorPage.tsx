import { OctagonXIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ErrorPageProps {
  error: string;
}

function ErrorPage({error}: ErrorPageProps) {
	const { t } = useTranslation();

	return (
		<div className="page items-center justify-center">
			<div className="flex flex-col items-center gap-3 rounded-2xl border border-defeat/30 bg-defeat/5 p-8">
				<OctagonXIcon className="size-9 text-defeat" />
				<p className="text-defeat font-semibold"> {t("errorPage.title")} </p>
				<p className="text-defeat font-bold"> {error} </p>
				<p className="text-text-dim"> {t("errorPage.hint")}</p>
			</div>
			</div>
	);
}

export default ErrorPage;
