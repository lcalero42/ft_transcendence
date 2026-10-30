import { OctagonXIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface ErrorPageProps {
  error: string;
  homeLink?: boolean;
}

function ErrorPage({error, homeLink}: ErrorPageProps) {
	const { t } = useTranslation();

	return (
		<div className="page items-center justify-center">
			<div className="flex flex-col items-center gap-3 rounded-2xl border border-defeat/30 bg-defeat/5 p-8">
				<OctagonXIcon className="size-9 text-defeat" />
				<p className="text-defeat font-semibold"> {t("errorPage.title")} </p>
				<p className="text-defeat font-bold"> {error} </p>
				{homeLink ? (
					<Link
						to="/home"
						className="text-defeat border-defeat/40 hover:bg-defeat/10 mt-1 rounded-lg border px-4 py-2 transition-colors"
					>
						{t("notFound.back")}
					</Link>
				) : (
					<p className="text-text-dim"> {t("errorPage.hint")}</p>
				)}
			</div>
			</div>
	);
}

export default ErrorPage;
