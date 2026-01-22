import { Link, usePage } from "@inertiajs/react";
import { FaCog, FaDollarSign, FaLayerGroup } from "react-icons/fa";
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
        { href: "/", label: "Dashboard", icon: LuLayoutDashboard },
        { href: "/uc-orders", label: "UC Orders", icon: LuShoppingCart },
        {
            href: "/ml-orders",
            label: "Diamond Orders",
            icon: IoDiamondOutline,
        },
        { href: "/service-products", label: "Service Orders", icon: LuStar },
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
        w-64 bg-white border-r border-gray-200 flex flex-col
        z-50 transition-transform duration-300

        fixed inset-y-0 left-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}

        md:translate-x-0
        md:sticky md:top-0 md:left-0
        md:h-screen
    `}
            >
                {/* Branding */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">
                        Admin Panel
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Game Shop</p>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            let isActive;
                            if (item.href === "/products-uc") {
                                isActive = url.startsWith("/products-"); // barcha products- yo‘llar faollashadi
                            } else if (item.href.startsWith("/spin-sectors")) {
                                // all spin-* routes
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
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-gray-700 hover:bg-gray-50"
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

                {/* Profile footer */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            A
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
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
