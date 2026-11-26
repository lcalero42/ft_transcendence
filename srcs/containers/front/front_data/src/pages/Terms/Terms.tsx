import { useTranslation } from "react-i18next";
import LegalLayout, { type LegalSection } from "@/components/LegalLayout/LegalLayout";
import { LAST_UPDATED, TERMS_SECTIONS, TERMS_VALUES } from "./termsContent";

function Terms() {
	const { t } = useTranslation("terms");

	function list(key: string) {
		const value: unknown = t(key, { ...TERMS_VALUES, returnObjects: true });
		return Array.isArray(value) ? (value as string[]) : undefined;
	}

	const sections: LegalSection[] = TERMS_SECTIONS.map((key) => ({
		title: t(`${key}.title`),
		paragraphs: list(`${key}.paragraphs`),
		items: list(`${key}.items`),
	}));

	return <LegalLayout title={t("title")} lastUpdated={LAST_UPDATED} sections={sections} />;
}

export default Terms;
