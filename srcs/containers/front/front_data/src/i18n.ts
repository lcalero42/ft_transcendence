import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";

export const LANGUAGES = ["en", "fr", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

const DEFAULT_LANGUAGE: Language = "en";
const STORAGE_KEY = "language";

function readStoredLanguage(): Language {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return LANGUAGES.find((language) => language === stored) ?? DEFAULT_LANGUAGE;
	} catch {
		return DEFAULT_LANGUAGE;
	}
}

void i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		fr: { translation: fr },
		es: { translation: es },
	},
	lng: readStoredLanguage(),
	fallbackLng: DEFAULT_LANGUAGE,
	supportedLngs: LANGUAGES,
	interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;

i18n.on("languageChanged", (language) => {
	document.documentElement.lang = language;
	try {
		localStorage.setItem(STORAGE_KEY, language);
	} catch {
		return;
	}
});

export default i18n;
