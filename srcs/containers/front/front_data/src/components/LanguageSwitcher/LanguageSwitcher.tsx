import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, type Language } from "@/i18n";

const FLAGS: Record<Language, ReactNode> = {
	en: (
		<svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
			<rect width="60" height="40" fill="#012169" />
			<path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
			<path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3" />
			<path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="13" />
			<path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8" />
		</svg>
	),
	fr: (
		<svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
			<rect width="20" height="40" fill="#0055A4" />
			<rect x="20" width="20" height="40" fill="#fff" />
			<rect x="40" width="20" height="40" fill="#EF4135" />
		</svg>
	),
	es: (
		<svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
			<rect width="60" height="40" fill="#AA151B" />
			<rect y="10" width="60" height="20" fill="#F1BF00" />
		</svg>
	),
};

function LanguageSwitcher({ className = "" }: { className?: string }) {
	const { t, i18n } = useTranslation();

	return (
		<div role="group" aria-label={t("language.label")} className={`flex shrink-0 items-center gap-2 ${className}`}>
			{LANGUAGES.map((language) => {
				const isActive = i18n.resolvedLanguage === language;
				return (
					<button
						key={language}
						type="button"
						onClick={() => { void i18n.changeLanguage(language); }}
						aria-label={t(`language.${language}`)}
						aria-pressed={isActive}
						title={t(`language.${language}`)}
						className={`clean-btn hoverable h-4 w-6 cursor-pointer overflow-hidden rounded-sm ${isActive ? "ring-2 ring-accent-purple" : "opacity-50 hover:opacity-100"}`}
					>
						{FLAGS[language]}
					</button>
				);
			})}
		</div>
	);
}

export default LanguageSwitcher;
