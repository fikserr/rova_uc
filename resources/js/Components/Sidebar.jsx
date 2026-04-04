import { Link, usePage } from "@inertiajs/react";
import { FaChartLine, FaCog, FaDollarSign, FaLayerGroup } from "react-icons/fa";
import { IoDiamondOutline } from "react-icons/io5";
import {
    LuBox,
    LuCalendarCheck,
    LuLayoutDashboard,
    LuShoppingCart,
    LuStar,
    LuUser,
} from "react-icons/lu";

export function Sidebar({ isOpen = true, onClose }) {
    const { url } = usePage();

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
        { href: "/currencies", label: "Curreny Rates", icon: FaDollarSign },
        { href: "/spin-sectors", label: "Spin management", icon: FaCog },
        { href: "/tasks", label: "Tasks", icon: LuCalendarCheck },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
        w-64 bg-white border-r dark:bg-slate-900 dark:border-slate-800 border-gray-200 flex flex-col
        z-50 transition-transform duration-300

        fixed inset-y-0 left-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}

        md:translate-x-0
        md:sticky md:top-0 md:left-0
        md:h-screen
    `}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        Admin Panel
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 dark:text-white/70">
                        Game Shop
                    </p>
                </div>

                <nav
                    className="flex-1 p-4 overflow-y-auto
    /* Scrollbar Width */
    [&::-webkit-scrollbar]:w-1.5

    /* Track (Background) */
    [&::-webkit-scrollbar-track]:bg-transparent

    /* Thumb (The moving bit) - Light Mode */
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-gray-300

    /* Thumb - Dark Mode */
    dark:[&::-webkit-scrollbar-thumb]:bg-slate-700
    dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600"
                >
                    <ul className="space-y-2">
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
                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                                            isActive
                                                ? "bg-blue-50 text-blue-600 dark:text-white dark:bg-gray-600/50"
                                                : "text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-600/50"
                                        }`}
                                        onClick={onClose} // closes sidebar on mobile
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            A
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Admin User
                            </p>
                            <p className="text-xs text-gray-500">
                                admin@ucstore.com
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
