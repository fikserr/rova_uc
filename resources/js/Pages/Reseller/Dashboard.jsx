import { Head, Link, router, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    BarChart3,
    ChevronRight,
    Globe,
    Plus,
    ShoppingBag,
    Tag,
    TrendingDown,
    TrendingUp,
    Wallet,
    Zap,
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

const STATUS = {
    completed: { label: "Bajarildi", dot: "bg-emerald-400" },
    delivered: { label: "Yetkazildi", dot: "bg-emerald-400" },
    paid: { label: "To'landi", dot: "bg-emerald-400" },
    processing: { label: "Jarayonda", dot: "bg-blue-400" },
    pending: { label: "Kutilmoqda", dot: "bg-amber-400" },
    canceled: { label: "Bekor", dot: "bg-rose-400" },
    failed: { label: "Xato", dot: "bg-rose-400" },
};

function StatusPill({ status }) {
    const s = STATUS[status] ?? { label: status, dot: "bg-slate-400" };
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${s.dot}`} />
            <span className="text-[11px] font-semibold text-slate-400">
                {s.label}
            </span>
        </span>
    );
}

export default function ResellerDashboard() {
    const { balance, stats, orders, products } = usePage().props;
    const { i18n } = useTranslation();
    const [showLang, setShowLang] = useState(false);
    const { t } = useTranslation();

    const [tab, setTabState] = useState(() =>
        new URLSearchParams(window.location.search).get("tab") === "prices"
            ? "prices"
            : "orders",
    );

    const setTab = (key) => {
        setTabState(key);
        router.visit(key === "prices" ? "/reseller?tab=prices" : "/reseller", {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

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
        <>
            <Head title="Reseller" />
            <div className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-8">
                {/* ─── DASHBOARD TAB ─── */}
                {tab === "orders" && (
                    <div className="space-y-5 container">
                        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-600/20 via-violet-800/10 to-transparent border border-violet-500/15 p-5">
                            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />
                            <div className="absolute -right-4 top-12 size-20 rounded-full bg-violet-400/5 blur-xl pointer-events-none" />
                            <div className="relative">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                                            {t('balance.current_balance')}
                                        </p>
                                        <p className="text-3xl font-black text-white mt-1 tracking-tight">
                                            {fmt(balance)}
                                            <span className="text-lg text-slate-500 font-semibold ml-1.5">
                                                UZS
                                            </span>
                                        </p>
                                    </div>
                                    <div className="size-11 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                                        <Wallet className="size-5 text-violet-400" />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href="/reseller/balance"
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white transition-all"
                                    >
                                        <Plus className="size-3.5" /> {''}
                                        {t('profile.top_up')}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                {
                                    label: t('shop.total'),
                                    value: stats.total_orders,
                                    suffix: "",
                                    color: "text-slate-300",
                                    icon: BarChart3,
                                },
                                {
                                    label: t('purchases.stats.completed'),
                                    value: stats.completed,
                                    suffix: "",
                                    color: "text-emerald-400",
                                    icon: TrendingUp,
                                },
                                {
                                    label: t('purchases.status.pending'),
                                    value: stats.pending,
                                    suffix: "",
                                    color: "text-amber-400",
                                    icon: Zap,
                                },
                                {
                                    label: t('reseller.today'),
                                    value: fmt(stats.today_spent),
                                    suffix: " UZS",
                                    color: "text-blue-400",
                                    icon: TrendingUp,
                                },
                                {
                                    label: t('reseller.this_month'),
                                    value: fmt(stats.month_spent),
                                    suffix: " UZS",
                                    color: "text-violet-400",
                                    icon: BarChart3,
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
                                    className="bg-white/3 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-colors"
                                >
                                    <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
                                        {s.label}
                                    </p>
                                    <p
                                        className={`text-sm font-black mt-1 leading-tight ${s.color}`}
                                    >
                                        {s.value}
                                        {s.suffix && (
                                            <span className="text-[10px] font-semibold text-slate-600 ml-0.5">
                                                {s.suffix}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    {t('reseller.orders')}
                                </h2>
                                <span className="text-[10px] text-slate-600">
                                    {t('reseller.lastOrders')}
                                </span>
                            </div>

                            {orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="size-14 rounded-2xl bg-white/3 flex items-center justify-center mb-3">
                                        <ShoppingBag className="size-6 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">
                                        {t('reseller.noOrdersYet')}
                                    </p>
                                    <p className="text-slate-700 text-xs mt-1">
                                        {t('reseller.makeYourFirstPurchase')}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {orders.map((o) => (
                                        <div
                                            key={o.id}
                                            className="group flex items-center gap-3 p-3 bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-default"
                                        >
                                            {o.image_url ? (
                                                <img
                                                    src={o.image_url}
                                                    alt=""
                                                    className="size-10 rounded-xl object-cover shrink-0 opacity-90"
                                                />
                                            ) : (
                                                <div className="size-10 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center shrink-0">
                                                    <ShoppingBag className="size-4 text-violet-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold text-white truncate">
                                                        {o.game_name}
                                                    </p>
                                                    <p className="text-sm font-black text-white shrink-0">
                                                        {fmt(o.price_uzs)}
                                                        <span className="text-[10px] text-slate-600 font-normal ml-0.5">
                                                            UZS
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 mt-0.5">
                                                    <p className="text-xs text-slate-600 truncate">
                                                        {o.variant_name}
                                                    </p>
                                                    <StatusPill
                                                        status={o.status}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-slate-700 font-mono">
                                                        #{o.game_target}
                                                    </span>
                                                    {o.zone_id && (
                                                        <span className="text-[10px] text-slate-700 font-mono">
                                                            Z:{o.zone_id}
                                                        </span>
                                                    )}
                                                    {o.saved_uzs > 0 && (
                                                        <span className="text-[10px] font-bold text-emerald-500">
                                                            -{fmt(o.saved_uzs)}{" "}
                                                            UZS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="size-3.5 text-slate-700 shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── PRICES TAB ─── */}
                {tab === "prices" && (
                    <div className="space-y-4 container">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                Reseller narxlari
                            </h2>
                        </div>

                        {Object.keys(products).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="size-14 rounded-2xl bg-white/3 flex items-center justify-center mb-3">
                                    <Tag className="size-6 text-slate-600" />
                                </div>
                                <p className="text-slate-500 text-sm">
                                    Reseller narxlar belgilanmagan
                                </p>
                                <p className="text-slate-700 text-xs mt-1">
                                    Admin bilan bog'laning
                                </p>
                            </div>
                        ) : (
                            Object.entries(products).map(([game, variants]) => (
                                <div
                                    key={game}
                                    className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                                        {variants[0]?.image_url && (
                                            <img
                                                src={variants[0].image_url}
                                                alt={game}
                                                className="size-6 rounded-lg object-cover"
                                            />
                                        )}
                                        <p className="font-bold text-white text-sm">
                                            {game}
                                        </p>
                                        <span className="ml-auto text-[10px] text-slate-600">
                                            {variants.length} ta
                                        </span>
                                    </div>
                                    <div className="divide-y divide-white/3">
                                        {variants.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
                                            >
                                                <p className="text-sm text-slate-300 font-medium truncate flex-1 mr-4">
                                                    {p.name}
                                                </p>
                                                <div className="text-right shrink-0 flex items-center gap-3">
                                                    <span className="text-xs text-slate-600 line-through">
                                                        {fmt(p.price_uzs)}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-black text-white">
                                                            {fmt(
                                                                p.reseller_price_uzs,
                                                            )}
                                                            <span className="text-[10px] text-slate-600 font-normal ml-0.5">
                                                                UZS
                                                            </span>
                                                        </p>
                                                        <p className="text-[10px] font-bold text-emerald-400 text-right">
                                                            -
                                                            {p.discount_percent}
                                                            %
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
