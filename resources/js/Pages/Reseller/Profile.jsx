import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    BarChart3,
    Calendar,
    Globe,
    LayoutDashboard,
    LogOut,
    Plus,
    ShoppingBag,
    Sparkles,
    Tag,
    TrendingDown,
    User,
    Wallet,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
    { code: "uz", label: "O'zbek", flag: "🇺🇿" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "en", label: "English", flag: "🇬🇧" },
];

function fmt(n) {
    return Number(n ?? 0).toLocaleString("fr-FR");
}

function Sidebar({ active }) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    const NAV = [
        { href: "/reseller",         icon: LayoutDashboard, label: "Dashboard" },
        { href: "/reseller",         icon: Tag,             label: "Narxlarim", hash: "#prices" },
        { href: "/reseller/shop",    icon: ShoppingBag,     label: "Do'kon" },
        { href: "/reseller/balance", icon: Wallet,          label: "Balans" },
        { href: "/reseller/profile", icon: User,            label: "Profil" },
    ];

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col bg-[#0f0f1a] border-r border-white/5 z-40">
            <div className="px-5 pt-7 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-violet-600 flex items-center justify-center">
                        <Sparkles className="size-4 text-white" />
                    </div>
                    <span className="font-black text-white tracking-wide text-lg">ROVA</span>
                    <span className="text-[10px] font-bold bg-violet-600/20 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-md ml-auto">PRO</span>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-0.5 mt-2">
                {NAV.map(n => (
                    <a
                        key={n.label}
                        href={n.href}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            active === n.label
                                ? "bg-violet-600/15 text-violet-300 border border-violet-500/20"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/3"
                        }`}
                    >
                        <n.icon className="size-4 shrink-0" />
                        {n.label}
                    </a>
                ))}
            </nav>

            <div className="px-3 pb-6">
                <form method="POST" action="/logout">
                    <input type="hidden" name="_token" value={csrfToken} />
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 transition-all">
                        <LogOut className="size-4" />
                        Chiqish
                    </button>
                </form>
            </div>
        </aside>
    );
}

export default function ResellerProfile() {
    const { user, balance, stats } = usePage().props;
    const { i18n } = useTranslation();
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [langCode, setLangCode] = useState(
        () => (localStorage.getItem("lang") || i18n.language || user.language || "uz").slice(0, 2)
    );

    const currentLang = LANGUAGES.find(l => l.code === langCode) ?? LANGUAGES[0];

    const changeLang = (code) => {
        setLangCode(code);
        i18n.changeLanguage(code);
        localStorage.setItem("lang", code);
        axios.patch("/user/language", { language: code }).catch(() => {});
        setShowLangMenu(false);
    };

    const handleLogout = () => router.post("/logout");

    const createdDate = new Date(user.created_at);
    const formattedDate = `${String(createdDate.getDate()).padStart(2, "0")}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${createdDate.getFullYear()}`;
    const displayName = user.username || `#${user.id}`;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <Head title="Profil" />

            <Sidebar active="Profil" />

            <div className="lg:ml-60 min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 h-14 flex items-center px-4 lg:px-8 gap-3">
                    <span className="font-bold text-sm text-white hidden lg:block flex-1">Profil</span>
                    <div className="flex items-center gap-2 lg:ml-auto">
                        {/* Language switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLangMenu((v) => !v)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 text-xs font-bold text-slate-300 transition-all"
                            >
                                <span>{currentLang.flag}</span>
                                <span>{currentLang.code.toUpperCase()}</span>
                                <Globe className="size-3 text-slate-600" />
                            </button>
                            {showLangMenu && (
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

                        <a
                            href="/reseller/balance"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all"
                        >
                            <Plus className="size-3.5" /> To'ldirish
                        </a>
                    </div>
                </header>

                <div className="flex-1 px-4 lg:px-8 py-5 pb-28 lg:pb-8 max-w-2xl">
                    <div className="space-y-4">
                        {/* Profile card */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 via-violet-800/10 to-transparent border border-violet-500/15 p-5">
                            <div className="absolute -right-6 -top-6 size-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />
                            <div className="relative flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                                    <User className="size-7 text-violet-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-white text-lg truncate">{displayName}</p>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                                        <Calendar className="size-3.5" />
                                        <span>A'zo bo'lgan: {formattedDate}</span>
                                    </div>
                                    <span className="inline-block mt-1.5 text-[10px] font-bold bg-violet-600/20 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-md">
                                        RESELLER
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Balance */}
                        <div className="rounded-2xl bg-white/3 border border-white/6 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Joriy balans</p>
                                <p className="text-2xl font-black text-white mt-0.5">
                                    {fmt(balance)}
                                    <span className="text-sm text-slate-500 font-semibold ml-1.5">UZS</span>
                                </p>
                            </div>
                            <a
                                href="/reseller/balance"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all"
                            >
                                <Plus className="size-3.5" /> To'ldirish
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { label: "Buyurtmalar", value: stats.total_orders,     suffix: "",     color: "text-slate-300",   icon: BarChart3 },
                                { label: "Sarflandi",   value: fmt(stats.total_spent), suffix: " UZS", color: "text-blue-400",    icon: Wallet },
                                { label: "Tejaldi",     value: fmt(stats.total_saved), suffix: " UZS", color: "text-emerald-400", icon: TrendingDown },
                            ].map((s) => (
                                <div key={s.label} className="bg-white/3 border border-white/5 rounded-xl p-3">
                                    <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">{s.label}</p>
                                    <p className={`text-sm font-black mt-1 leading-tight ${s.color}`}>
                                        {s.value}
                                        {s.suffix && <span className="text-[9px] font-semibold text-slate-600 ml-0.5">{s.suffix}</span>}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Language (shown on mobile — desktop has sidebar) */}
                        <div className="rounded-2xl bg-white/3 border border-white/6 p-4 lg:hidden">
                            <div className="flex items-center gap-2 mb-3">
                                <Globe className="size-4 text-slate-500" />
                                <p className="text-sm font-bold text-slate-300">Til</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {LANGUAGES.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => changeLang(l.code)}
                                        className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                            langCode === l.code
                                                ? "bg-violet-600 text-white"
                                                : "bg-white/5 text-slate-500 hover:bg-white/8 hover:text-slate-300"
                                        }`}
                                    >
                                        <span>{l.flag}</span> {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Logout (mobile — desktop has sidebar) */}
                        <button
                            onClick={handleLogout}
                            className="lg:hidden w-full flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 hover:bg-rose-500/10 hover:border-rose-500/25 transition-all text-left"
                        >
                            <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
                                <LogOut className="size-4 text-rose-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-rose-400">Chiqish</p>
                                <p className="text-xs text-slate-600">Hisobdan chiqish</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom nav (mobile only) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f1a]/95 backdrop-blur-xl border-t border-white/6 px-4 py-2 flex items-center justify-around">
                <a href="/reseller" className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 hover:text-slate-400 transition-colors">
                    <LayoutDashboard className="size-5" />
                    <span className="text-[10px] font-bold">Dashboard</span>
                </a>
                <a href="/reseller/shop" className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 hover:text-slate-400 transition-colors">
                    <ShoppingBag className="size-5" />
                    <span className="text-[10px] font-bold">Do'kon</span>
                </a>
                <a href="/reseller/balance" className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 hover:text-slate-400 transition-colors">
                    <Plus className="size-5" />
                    <span className="text-[10px] font-bold">Balans</span>
                </a>
                <a href="/reseller/profile" className="flex-1 flex flex-col items-center gap-1 py-1 text-violet-400">
                    <User className="size-5" />
                    <span className="text-[10px] font-bold">Profil</span>
                </a>
            </nav>
        </div>
    );
}
