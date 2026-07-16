import { Head, router, usePage , Link } from "@inertiajs/react";
import axios from "axios";
import {
    BarChart3,
    Calendar,
    Globe,
    LogOut,
    Plus,
    TrendingDown,
    User,
    Wallet,
    ArrowLeft
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

export default function ResellerProfile() {
    const { user, balance, stats } = usePage().props;
    const { t } = useTranslation();


    const handleLogout = () => router.post("/logout");

    const createdDate = new Date(user.created_at);
    const formattedDate = `${String(createdDate.getDate()).padStart(2, "0")}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${createdDate.getFullYear()}`;
    const displayName = user.username || `#${user.id}`;

    return (
        <>
            <Head title="Profil" />
            <div className="flex-1 px-4 lg:px-8 py-5 pb-28 lg:pb-8 container">
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-600/20 via-violet-800/10 to-transparent border border-violet-500/15 p-5">
                        <div className="absolute -right-6 -top-6 size-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />
                        <div className="relative flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                                <User className="size-7 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-white text-lg truncate">
                                    {displayName}
                                </p>
                                <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                                    <Calendar className="size-3.5" />
                                    <span>{t('profile.member_since')} : {formattedDate}</span>
                                </div>
                                <span className="inline-block mt-1.5 text-[10px] font-bold bg-violet-600/20 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-md">
                                    RESELLER
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/3 border border-white/6 p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                {t('balance.current_balance')}
                            </p>
                            <p className="text-2xl font-black text-white mt-0.5">
                                {fmt(balance)}
                                <span className="text-sm text-slate-500 font-semibold ml-1.5">
                                    UZS
                                </span>
                            </p>
                        </div>

                        <a
                            href="/reseller/balance"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all"
                        >
                            <Plus className="size-3.5" /> {t('profile.top_up')}
                        </a>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        {[
                            {
                                label: t('reseller.orders'),
                                value: stats.total_orders,
                                suffix: "",
                                color: "text-slate-300",
                                icon: BarChart3,
                            },
                            {
                                label: t('purchases.stats.spent'),
                                value: fmt(stats.total_spent),
                                suffix: " UZS",
                                color: "text-blue-400",
                                icon: Wallet,
                            },
                            {
                                label: t('reseller.saved'),
                                value: fmt(stats.total_saved),
                                suffix: " UZS",
                                color: "text-emerald-400",
                                icon: TrendingDown,
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="bg-white/3 border border-white/5 rounded-xl p-3"
                            >
                                <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
                                    {s.label}
                                </p>
                                <p
                                    className={`text-sm font-black mt-1 leading-tight ${s.color}`}
                                >
                                    {s.value}
                                    {s.suffix && (
                                        <span className="text-[9px] font-semibold text-slate-600 ml-0.5">
                                            {s.suffix}
                                        </span>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="lg:hidden w-full flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 hover:bg-rose-500/10 hover:border-rose-500/25 transition-all text-left"
                    >
                        <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
                            <LogOut className="size-4 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-rose-400">
                                {t('settings.logout')}
                            </p>
                            <p className="text-xs text-slate-600">
                                {t('settings.logout_desc')}
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}
