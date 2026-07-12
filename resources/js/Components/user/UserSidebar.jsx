import VallerLogo from "@images/vg.png";
import { Link, usePage } from "@inertiajs/react";
import {
    Bell,
    CircleUser,
    History,
    Home,
    Moon,
    Sun,
    Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getTheme, toggleTheme } from "../../Hook/theme";

const NAV_ITEMS = [
    { href: "/user-services", label: "Bosh sahifa", icon: Home },
    { href: "/user-profile/user-balance", label: "Top-up", icon: Wallet },
    { href: "/user-purchases", label: "Tarix", icon: History },
    { href: "/user-notifications", label: "Xabarlar", icon: Bell },
    { href: "/user-profile", label: "Profil", icon: CircleUser },
];

export default function UserSidebar() {
    const { url } = usePage();
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        setIsDark(getTheme() === "dark");
    }, []);

    const handleToggle = () => {
        toggleTheme();
        setIsDark(getTheme() === "dark");
    };

    return (
        <aside className="hidden lg:flex flex-col w-64 shrink-0 fixed inset-y-0 left-0 z-30 bg-[#0d0c17] border-r border-white/5 px-4 py-6">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2 px-2 mb-8">
                <img
                    src={VallerLogo}
                    alt="Valler Gaming"
                    className="w-9 h-9 object-contain"
                />
                <div className="leading-tight">
                    <p className="text-white font-extrabold text-sm tracking-wide">
                        VALLER
                    </p>
                    <p className="text-violet-400 font-bold text-[11px] tracking-widest -mt-0.5">
                        GAMING
                    </p>
                </div>
            </Link>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;

                    // 🚀 FIXED HIGH-ACCURACY MATCHING ALGORITHM:
                    let isActive = false;

                    if (item.href === "/user-services") {
                        isActive =
                            url === "/" ||
                            url === "/user-services" ||
                            url.startsWith("/user-services/");
                    } else if (item.href === "/user-profile") {
                        // Enforce full clean isolation for base profile link
                        // Only active if URL is exactly /user-profile or sub-pages that ARE NOT user-balance
                        isActive =
                            url === "/user-profile" ||
                            (url.startsWith("/user-profile/") &&
                                !url.includes("/user-balance"));
                    } else {
                        // Standard nested sub-path checking matching loop logic
                        isActive =
                            url === item.href ||
                            url.startsWith(item.href + "/");
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <Icon className="size-4.5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Dark mode toggle */}
            <button
                onClick={handleToggle}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 text-sm font-medium"
            >
                <span className="flex items-center gap-3">
                    {isDark ? (
                        <Moon className="size-4.5" />
                    ) : (
                        <Sun className="size-4.5" />
                    )}
                    Dark mode
                </span>
                <span
                    className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                        isDark
                            ? "bg-violet-600 justify-end"
                            : "bg-slate-600 justify-start"
                    }`}
                >
                    <span className="size-4 rounded-full bg-white" />
                </span>
            </button>
        </aside>
    );
}
