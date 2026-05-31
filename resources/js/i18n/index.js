import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import uz from "./locales/uz.json";

const getTelegramLang = () => {
    try {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    } catch {
        return null;
    }
};

const getSupportedLang = (lang) => {
    const supported = ["en", "uz", "ru"];
    return supported.includes(lang) ? lang : null;
};

const savedLang = localStorage.getItem("lang");
const tgLang = getSupportedLang(getTelegramLang());
const browserLang = getSupportedLang(navigator.language?.slice(0, 2));
const detectedLang = savedLang || tgLang || browserLang || "en";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        uz: { translation: uz },
        ru: { translation: ru },
    },
    lng: detectedLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
});

export default i18n;
