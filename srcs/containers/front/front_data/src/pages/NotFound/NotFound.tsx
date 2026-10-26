import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function NotFound() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
			<p className="text-7xl font-bold text-accent-purple">404</p>
			<h1 className="text-2xl font-semibold">{t("notFound.title")}</h1>
			<p className="text-gray-low">{t("notFound.description")}</p>
			<Link to="/home" className="font-semibold text-accent-purple hover:underline">
				{t("notFound.back")}
			</Link>
		</div>
	);
}

export default NotFound;
