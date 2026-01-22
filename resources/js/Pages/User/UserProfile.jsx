import UserLayout from "@/Components/Layout/UserLayout";
import {
    Bell,
    Calendar,
    Check,
    Copy,
    Globe,
    Lock,
    LogOut,
    Moon,
    Settings,
    ShoppingBag,
    Sun,
    User,
    Users,
    Wallet,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

function UserProfile() {
    const [copiedReferral, setCopiedReferral] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Dark mode from localStorage
    const [mode, setMode] = useState(() => {
        const stored = localStorage.getItem("darkMode");
        return stored === "true" ? "dark" : "light";
    });

    const darkMode = mode === "dark";

    useEffect(() => {
        const handler = () => {
            const stored = localStorage.getItem("darkMode");
            setMode(stored === "true" ? "dark" : "light");
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const toggleDarkMode = () => {
        const next = !darkMode;
        localStorage.setItem("darkMode", next.toString());
        setMode(next ? "dark" : "light");
    };

    const handleCopyReferral = () => {
        navigator.clipboard.writeText("https://t.me/yourbot?start=SAFAROV_SH");
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
    };

    const stats = [
        {
            id: "purchases",
            label: "Xaridlar",
            value: "12",
            icon: ShoppingBag,
            color: "from-blue-600 to-indigo-600",
        },
        {
            id: "spent",
            label: "Jami sarflangan",
            value: "$248",
            icon: Wallet,
            color: "from-emerald-500 to-teal-600",
        },
        {
            id: "referrals",
            label: "Taklif qilganlar",
            value: "8",
            icon: Users,
            color: "from-amber-500 to-orange-600",
        },
    ];

    const settingsOptions = [
        {
            id: "notifications",
            label: "Bildirishnomalar",
            icon: Bell,
            description: "Push bildirishnomalar",
        },
        {
            id: "language",
            label: "Til",
            icon: Globe,
            description: "O'zbek tili",
        },
        {
            id: "security",
            label: "Xavfsizlik",
            icon: Lock,
            description: "Parol va xavfsizlik",
        },
        {
            id: "logout",
            label: "Chiqish",
            icon: LogOut,
            description: "Hisobdan chiqish",
            danger: true,
        },
    ];

    return (
        <div
            className={`min-h-[calc(100vh-140px)] px-4 py-6 pb-24 ${
                darkMode
                    ? "bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"
                    : "bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50"
            }`}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-5 sm:p-8 mb-6 shadow-xl">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="bg-white/20 p-3 sm:p-4 rounded-2xl border-4 border-white/30">
                            <User className="size-12 sm:size-16 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                SAFAROV_SH
                            </h1>
                            <div className="flex items-center gap-2 text-white/90 text-sm">
                                <Calendar className="size-4" />
                                <span>A'zo: Yanvar 2025</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="bg-white/20 p-3 rounded-xl hover:bg-white/30"
                        >
                            <Settings className="size-6 text-white" />
                        </button>
                    </div>

                    {/* Balance */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">Hisobingiz</p>
                            <p className="text-3xl font-bold text-white">
                                0 USDT
                            </p>
                        </div>
                        <button className="bg-white text-blue-600 px-5 py-2 rounded-xl font-semibold">
                            To'ldirish
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.id}
                                className={`rounded-2xl p-4 sm:p-6 border ${
                                    darkMode
                                        ? "bg-slate-800/80 border-slate-700 text-white"
                                        : "bg-white/80 border-slate-100"
                                }`}
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

                {/* Invite Friends */}
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 sm:p-8 mb-6 shadow-xl">
                    <div className="flex gap-4 mb-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <Users className="size-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white">
                                Do'stlarni taklif qiling
                            </h3>
                            <p className="text-white/90 text-sm">
                                1 bepul spin va 5% bonus
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 border border-white/20 mb-4">
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-white text-xs sm:text-sm break-all">
                                https://t.me/yourbot?start=SAFAROV_SH
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
                                8
                            </div>
                            <div className="text-xs text-white/80">
                                Do'stlar
                            </div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white">
                                $40
                            </div>
                            <div className="text-xs text-white/80">
                                Ishlab topilgan
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Bottom Sheet */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
                    <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 sm:p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-lg font-bold">Sozlamalar</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 rounded-xl bg-slate-100"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Dark Mode */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border">
                                <div className="flex items-center gap-3">
                                    {darkMode ? <Moon /> : <Sun />}
                                    <span className="font-semibold">
                                        {darkMode
                                            ? "Qorong'i rejim"
                                            : "Yorug' rejim"}
                                    </span>
                                </div>
                                <button
                                    onClick={toggleDarkMode}
                                    className={`relative w-14 h-8 rounded-full ${
                                        darkMode
                                            ? "bg-blue-600"
                                            : "bg-slate-300"
                                    }`}
                                >
                                    <div
                                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                                            darkMode
                                                ? "translate-x-6"
                                                : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {settingsOptions.map((opt) => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() =>
                                            opt.id === "logout" &&
                                            alert("Hisobdan chiqildi")
                                        }
                                        className={`w-full flex gap-4 p-4 rounded-2xl border ${
                                            opt.danger
                                                ? "bg-red-50 border-red-200"
                                                : "bg-slate-50 border-slate-200"
                                        }`}
                                    >
                                        <div
                                            className={`p-3 rounded-xl ${
                                                opt.danger
                                                    ? "bg-red-100"
                                                    : "bg-linear-to-br from-blue-600 to-indigo-600"
                                            }`}
                                        >
                                            <Icon
                                                className={`size-5 ${opt.danger ? "text-red-600" : "text-white"}`}
                                            />
                                        </div>
                                        <div className="text-left">
                                            <div
                                                className={`font-semibold ${opt.danger ? "text-red-600" : "text-slate-900"}`}
                                            >
                                                {opt.label}
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                {opt.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

UserProfile.layout = (page) => <UserLayout>{page}</UserLayout>;
export default UserProfile;
