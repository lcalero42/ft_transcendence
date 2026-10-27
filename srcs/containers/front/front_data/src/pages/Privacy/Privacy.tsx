import { useTranslation } from "react-i18next";
import LegalLayout, { type LegalSection } from "@/components/LegalLayout/LegalLayout";
import { LAST_UPDATED, PRIVACY_SECTIONS, PRIVACY_VALUES } from "./privacyContent";

function Privacy() {
	const { t } = useTranslation("privacy");

	function list(key: string) {
		const value: unknown = t(key, { ...PRIVACY_VALUES, returnObjects: true });
		return Array.isArray(value) ? (value as string[]) : undefined;
	}

	const sections: LegalSection[] = PRIVACY_SECTIONS.map((key) => ({
		title: t(`${key}.title`),
		paragraphs: list(`${key}.paragraphs`),
		items: list(`${key}.items`),
	}));

	return <LegalLayout title={t("title")} lastUpdated={LAST_UPDATED} sections={sections} />;
}

export default Privacy;
