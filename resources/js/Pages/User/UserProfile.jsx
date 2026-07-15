import { toggleTheme } from "@/Hook/theme";
import { Head, Link, router, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    Bell,
    Calendar,
    Check,
    Copy,
    Globe,
    Lock,
    LogOut,
    MessageCircle,
    Moon,
    Settings,
    ShoppingBag,
    Sun,
    User,
    Users,
    Wallet,
    X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "uz", label: "O'zbek", flag: "🇺🇿" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
];

function UserProfile() {
    const [copiedReferral, setCopiedReferral] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const { user, referral, stats = {} } = usePage().props;
    const { t, i18n } = useTranslation();

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem("lang", code);
        axios.patch("/user/language", { language: code }).catch(() => {});
    };

    const referralLink = referral?.link || "https://t.me/yourbot?start=ref";
    const referralFriendsCount = Number(referral?.friends_count ?? 0);
    const referralEarnedAmount = Number(referral?.earned_amount ?? 0);
    const referralCurrency = referral?.currency || "UZS";

    const handleCopyReferral = () => {
        navigator.clipboard.writeText(referralLink);
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
    };

    const Userstats = [
        {
            id: "purchases",
            label: t("profile.stats.purchases"),
            value: String(Number(stats.total_purchases ?? 0)),
            icon: ShoppingBag,
            color: "from-blue-600 to-indigo-600",
        },
        {
            id: "spent",
            label: t("profile.stats.spent"),
            value: `${Number(stats.total_spent ?? 0).toLocaleString("fr-FR")} UZS`,
            icon: Wallet,
            color: "from-emerald-500 to-teal-600",
        },
        {
            id: "referrals",
            label: t("profile.stats.referrals"),
            value: String(referralFriendsCount),
            icon: Users,
            color: "from-amber-500 to-orange-600",
        },
    ];

    // Moved inside the component function to stay fully reactive to any backend Inertia data updates
    const settingsOptions = [
        {
            id: "notifications",
            label: t("settings.notifications"),
            icon: Bell,
            description: t("settings.notifications_desc"),
            link: "/user-notifications",
        },
        {
            id: "security",
            label: t("settings.security"),
            icon: Lock,
            description: t("settings.security_desc"),
            link: "/user-profile/security",
        },
        {
            id: "support",
            label: t("settings.support"),
            icon: MessageCircle,
            description: t("settings.support_desc"),
            link: "https://t.me/VallerUz",
            external: true,
        },
        {
            id: "logout",
            label: t("settings.logout"),
            icon: LogOut,
            description: t("settings.logout_desc"),
            danger: true,
        },
    ];

    const createdDate = new Date(user.created_at);
    const day = String(createdDate.getDate()).padStart(2, "0");
    const month = String(createdDate.getMonth() + 1).padStart(2, "0");
    const year = createdDate.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;
    const displayName = user?.username || String(user?.id || "user");

    const handleLogout = () => {
        router.post("/logout");
    };

    // Calculate unread formatting reactively
    const unreadCount = Number(stats.unread ?? 0);

    return (
        <div className="min-h-[calc(100vh-140px)] px-4 py-6 pb-8 transition-all">
            <Head>
                <title>{t("profile.title")}</title>
            </Head>

            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-linear-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl p-5 sm:p-8 mb-6 shadow-xl transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="bg-white/20 p-3 sm:p-4 rounded-2xl border-4 border-white/30">
                            <User className="size-6 sm:size-16 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-base md:text-xl font-bold text-white">
                                {displayName.length > 18
                                    ? `${displayName.slice(0, 18)}...`
                                    : displayName}
                            </h1>
                            <div className="flex items-center gap-2 text-white/90 md:text-sm text-xs">
                                <Calendar className="size-4" />
                                <span>
                                    {t("profile.member_since")}: {formattedDate}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="relative bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-colors"
                        >
                            <Settings className="size-4 md:size-6 text-white" />
                            {/* Visual indicator directly on the profile dashboard gear icon */}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex size-3 bg-red-500 rounded-full ring-2 ring-blue-600 animate-pulse" />
                            )}
                        </button>
                    </div>

                    {/* Balance */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">
                                {t("profile.balance")}
                            </p>
                            <p className="text-xl md:text-3xl font-bold text-white">
                                {Number(user?.balance ?? 0).toLocaleString(
                                    "fr-FR",
                                )}{" "}
                                UZS
                            </p>
                        </div>
                        <Link href="/user-profile/user-balance">
                            <button className="bg-white text-blue-600 px-5 py-2 rounded-xl font-semibold">
                                {t("profile.top_up")}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    {Userstats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.id}
                                className="backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all dark:bg-slate-800/80 dark:border-slate-700 bg-white/80 border-slate-100 border dark:text-white"
                            >
                                <div
                                    className={`bg-linear-to-br ${stat.color} w-11 h-11 rounded-xl flex items-center justify-center mb-2`}
                                >
                                    <Icon className="size-5 text-white" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold">
                                    {stat.value}
                                </div>
                                <div className="text-xs sm:text-sm opacity-70">
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Referral */}
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 sm:p-8 mb-6 shadow-xl">
                    <div className="flex gap-4 mb-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <Users className="size-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white">
                                {t("referral.title")}
                            </h3>
                            <p className="text-white/90 text-sm">
                                {t("referral.description")}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 border border-white/20 mb-4">
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-white text-xs sm:text-sm break-all">
                                {referralLink}
                            </code>
                            <button
                                onClick={handleCopyReferral}
                                className="bg-white/20 p-2 rounded-lg"
                            >
                                {copiedReferral ? (
                                    <Check className="size-5 text-green-300" />
                                ) : (
                                    <Copy className="size-5 text-white" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white">
                                {referralFriendsCount}
                            </div>
                            <div className="text-xs text-white/80">
                                {t("referral.friends")}
                            </div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white">
                                {referralEarnedAmount.toLocaleString("fr-FR")}{" "}
                                {referralCurrency}
                            </div>
                            <div className="text-xs text-white/80">
                                {t("referral.earned")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center animate-fade-in">
                    <div className="border-2 border-blue-400 w-full md:max-w-md max-w-90 bg-white dark:bg-zinc-900 rounded-3xl sm:rounded-3xl h-max overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-3 sm:p-6 border-b border-zinc-400 dark:border-zinc-400 sticky top-0 bg-white dark:bg-zinc-900">
                            <h2 className="text-lg font-bold dark:text-white">
                                {t("settings.title")}
                            </h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 dark:text-white"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-zinc-300 border dark:border-zinc-700 dark:text-white">
                                <div className="flex items-center gap-3">
                                    <Moon className="dark:hidden" />
                                    <Sun className="hidden dark:block" />
                                    <span className="font-semibold">
                                        {t("settings.theme")}
                                    </span>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="relative w-14 h-8 rounded-full bg-slate-300 dark:bg-blue-600"
                                >
                                    <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform dark:translate-x-6" />
                                </button>
                            </div>

                            {/* Language Switcher */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 dark:text-white">
                                <div className="flex items-center gap-3 mb-3">
                                    <Globe className="size-5" />
                                    <span className="font-semibold">
                                        {t("settings.language")}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() =>
                                                changeLanguage(lang.code)
                                            }
                                            className={`py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                                                i18n.language === lang.code
                                                    ? "bg-blue-600 text-white shadow-md"
                                                    : "bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-white opacity-70 hover:opacity-100"
                                            }`}
                                        >
                                            <span>{lang.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Other Settings Options */}
                            {settingsOptions.map((opt) => {
                                const Icon = opt.icon;
                                if (opt.id === "logout") {
                                    return (
                                        <button
                                            type="button"
                                            className="w-full text-left"
                                            key={opt.id}
                                            onClick={handleLogout}
                                        >
                                            <div
                                                className={`w-full flex gap-4 p-4 mt-3 cursor-pointer rounded-2xl border dark:text-white ${
                                                    opt.danger
                                                        ? "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-500/40"
                                                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                                                }`}
                                            >
                                                <div className="p-3 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 shrink-0">
                                                    <Icon className="size-5 text-white" />
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0">
                                                    <div className="font-semibold truncate">
                                                        {opt.label}
                                                    </div>
                                                    <div className="text-xs opacity-70 truncate">
                                                        {opt.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                }

                                const Wrapper = opt.external ? "a" : Link;
                                const wrapperProps = opt.external
                                    ? {
                                          href: opt.link,
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                          className: "w-full block text-left",
                                      }
                                    : {
                                          href: opt.link || "#",
                                          className: "w-full block text-left",
                                      };

                                return (
                                    <Wrapper key={opt.id} {...wrapperProps}>
                                        <div className="w-full flex items-center justify-between gap-4 mt-3 p-4 cursor-pointer rounded-2xl border bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 dark:text-white hover:bg-slate-100/70 dark:hover:bg-zinc-800/70 transition-colors">
                                            <div className="flex gap-4 min-w-0">
                                                <div className="p-3 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 shrink-0">
                                                    <Icon className="size-5 text-white" />
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0">
                                                    <div className="font-semibold truncate">
                                                        {opt.label}
                                                    </div>
                                                    <div className="text-xs opacity-70 truncate">
                                                        {opt.description}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic verification of unread counter updates seamlessly inside map structure */}
                                            {opt.id === "notifications" &&
                                                unreadCount > 0 && (
                                                    <span className="flex items-center justify-center min-w-6 h-6 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shrink-0 animate-pulse shadow-md shadow-red-500/20">
                                                        {unreadCount > 99
                                                            ? "99+"
                                                            : unreadCount}
                                                    </span>
                                                )}
                                        </div>
                                    </Wrapper>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;
