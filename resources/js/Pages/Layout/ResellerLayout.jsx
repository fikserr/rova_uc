import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { Globe, HandCoins, Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ResellerBar from "../../Components/shared/ResellerBar";

const LANGUAGES = [
    { code: "uz", label: "O'zbek", flag: "🇺🇿" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "en", label: "English", flag: "🇬🇧" },
];

function fmt(n) {
    return Number(n ?? 0).toLocaleString("fr-FR");
}

function ResellerLayout({ children }) {
    const { user } = usePage().props;
    const { i18n } = useTranslation();
    const [showLang, setShowLang] = useState(false);

    const [langCode, setLangCode] = useState(() =>
        (localStorage.getItem("lang") || i18n.language || "uz").slice(0, 2),
    );

    const changeLang = (code) => {
        setLangCode(code);
        i18n.changeLanguage(code);
        localStorage.setItem("lang", code);
        axios.patch("/user/language", { language: code }).catch(() => {});
        setShowLang(false);
    };

    const currentLang =
        LANGUAGES.find((l) => l.code === langCode) ?? LANGUAGES[0];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white select-none">
            <header className="fixed top-0 left-0 lg:left-60 right-0 h-14 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 flex items-center justify-between z-50">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-violet-600 flex items-center justify-center">
                        <HandCoins className="size-3 text-white" />
                    </div>
                    <span className="font-black text-white tracking-wide text-[10px]">
                        Valler Reseller
                    </span>
                </div>

                <div className="flex items-center gap-2 lg:ml-auto">
                    <div className="relative">
                        <button
                            onClick={() => setShowLang((v) => !v)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/5 text-xs font-bold text-slate-300 transition-all"
                        >
                            <span>{currentLang.flag}</span>
                            <span>{currentLang.code.toUpperCase()}</span>
                            <Globe className="size-3 text-slate-500" />
                        </button>
                        {showLang && (
                            <div className="absolute right-0 top-full mt-1.5 bg-[#16161f] border border-white/8 rounded-xl overflow-hidden shadow-2xl z-50 w-36">
                                {LANGUAGES.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => changeLang(l.code)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-colors ${
                                            langCode === l.code
                                                ? "bg-violet-600/20 text-violet-300"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        <span>{l.flag}</span> {l.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link
                        href="/reseller/balance"
                        className="flex items-center gap-1 px-1 py-1.5 rounded-lg text-white text-xs font-bold transition-all w-max"
                    >
                        <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 border border-white/8">
                            <Wallet className="size-3.5 text-violet-400" />
                            <span className="text-sm font-black text-white flex items-center justify-center gap-0.5">
                                {fmt(user?.balance)}
                                <Plus className="size-3" />
                            </span>
                            <span className="text-[10px] text-slate-600 font-semibold">
                                UZS
                            </span>
                        </div>
                    </Link>
                </div>
            </header>
            <ResellerBar />
            <main className="pt-14 lg:ml-60 min-h-screen flex flex-col pb-20 lg:pb-0">
                {children}
            </main>
        </div>
    );
}

export default ResellerLayout;
