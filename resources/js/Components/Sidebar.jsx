import { Link, usePage } from "@inertiajs/react";
import { FaChartLine, FaCog, FaDollarSign, FaLayerGroup } from "react-icons/fa";
import { IoDiamondOutline } from "react-icons/io5";
import {
    LuBell,
    LuBox,
    LuCalendarCheck,
    LuLayoutDashboard,
    LuReceipt,
    LuShoppingCart,
    LuStar,
    LuUser,
} from "react-icons/lu";

export function Sidebar({ isOpen = true, onClose }) {
    const { url, props } = usePage();
    const authUser = props?.auth?.user ?? null;
    const displayName = authUser?.username || "Admin";
    const subText = authUser?.phone_number || "Administrator";
    const avatarLetter =
        String(displayName).trim().charAt(0).toUpperCase() || "A";

    const menuItems = [
        {
            href: "/admin/dashboard",
            label: "Dashboard",
            icon: LuLayoutDashboard,
        },
        { href: "/uc-orders", label: "UC Orders", icon: LuShoppingCart },
        { href: "/ml-orders", label: "Diamond Orders", icon: IoDiamondOutline },
        { href: "/service-orders", label: "Service Orders", icon: LuStar },
        {
            href: "/profit-analytics",
            label: "Profit Analytics",
            icon: FaChartLine,
        },
        {
            href: "/referral-settings",
            label: "Referral Settings",
            icon: FaLayerGroup,
        },
        { href: "/users", label: "Users", icon: LuUser },
        { href: "/products-uc", label: "Products", icon: LuBox },
        { href: "/currencies", label: "Currency Rates", icon: FaDollarSign },
        { href: "/spin-sectors", label: "Spin Management", icon: FaCog },
        { href: "/tasks", label: "Tasks", icon: LuCalendarCheck },
        { href: "/broadcast-notifications", label: "Broadcast", icon: LuBell },
        { href: "/manual-topups", label: "Manual Topuplar", icon: LuReceipt },
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
    w-64 flex flex-col z-50 transition-transform duration-300
    bg-white dark:bg-slate-900
    border-r border-slate-200 dark:border-slate-800
    fixed inset-y-0 left-0 h-screen
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
`}
            >
                {/* ── Brand header ── */}
                <div className="px-5 py-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/40 shrink-0">
                            <LuLayoutDashboard className="size-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                                Admin Panel
                            </h1>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                Game Shop
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Navigation ── */}
                <nav
                    className="flex-1 px-3 py-3 overflow-y-auto
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-slate-200
                    dark:[&::-webkit-scrollbar-thumb]:bg-slate-700
                    dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600"
                >
                    <ul className="space-y-0.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            let isActive;

                            if (item.href === "/admin/dashboard") {
                                isActive =
                                    url === "/" ||
                                    url === "/admin/dashboard" ||
                                    url.startsWith("/admin/dashboard/");
                            } else if (item.href === "/products-uc") {
                                isActive = url.startsWith("/products-");
                            } else if (item.href.startsWith("/spin-sectors")) {
                                isActive = url.startsWith("/spin-");
                            } else {
                                isActive =
                                    url === item.href ||
                                    url.startsWith(item.href + "/");
                            }

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={`
                                            relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                                            ${
                                                isActive
                                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                                            }
                                        `}
                                    >
                                        {/* Active left bar */}
                                        {isActive && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-blue-500 dark:bg-blue-400" />
                                        )}

                                        {/* Icon container */}
                                        <span
                                            className={`
                                            size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                            ${
                                                isActive
                                                    ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 group-hover:bg-slate-200"
                                            }
                                        `}
                                        >
                                            <Icon className="size-3.5" />
                                        </span>

                                        <span className="truncate">
                                            {item.label}
                                        </span>

                                        {/* Active dot indicator */}
                                        {isActive && (
                                            <span className="ml-auto size-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* ── User footer ── */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                        <div className="size-8 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                            {avatarLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate leading-tight">
                                {displayName}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                {subText}
                            </p>
                        </div>
                        <div
                            className="size-2 rounded-full bg-emerald-400 shrink-0"
                            title="Online"
                        />
                    </div>
                </div>
            </aside>
        </>
    );
}
