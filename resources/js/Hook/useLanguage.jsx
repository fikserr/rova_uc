import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../lang/translations";

const LS_KEY = "admin_lang";
const DEFAULT = "uz";

const LangContext = createContext({ lang: DEFAULT, setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => {
        try { return localStorage.getItem(LS_KEY) || DEFAULT; }
        catch { return DEFAULT; }
    });

    const setLang = (code) => {
        setLangState(code);
        try { localStorage.setItem(LS_KEY, code); } catch {}
    };

    const t = (key) => translations[lang]?.[key] ?? translations[DEFAULT]?.[key] ?? key;

    return (
        <LangContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LangContext);
}

export function useT() {
    return useContext(LangContext).t;
}
