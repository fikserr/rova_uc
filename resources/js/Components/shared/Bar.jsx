import { Link, usePage } from "@inertiajs/react";
import {
    Dices,
    ListTodo,
    ShieldCheck,
    ShoppingBag,
    UserCircle,
    Wallet,
} from "lucide-react";

function Bar() {
    const { url } = usePage();

    const navItems = [
        { id: "ruletka", label: "Ruletka", icon: Dices, href: "/user-spin" },
        {
            id: "vazifalar",
            label: "Vazifalar",
            icon: ListTodo,
            href: "/user-tasks",
        },
        {
            id: "xizmatlar",
            label: "Xizmatlar",
            icon: ShieldCheck,
            href: "/user-services",
        },
        {
            id: "xaridlarim",
            label: "Xaridlarim",
            icon: ShoppingBag,
            href: "/user-purchases",
        },
        { id: "hisob", label: "Hisob", icon: Wallet, href: "/user-balance" },
        {
            id: "profil",
            label: "Profil",
            icon: UserCircle,
            href: "/user-profile",
        },
    ];


    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 border-t  z-50 transition-colors duration-300 bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-800 py-0 shadow-black pb-[env(safe-area-inset-bottom)] `}
        >
            <div className="max-w-7xl mx-auto px-1">
                <div className="grid grid-cols-6 gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = url.startsWith(item.href);

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                                    isActive
                                        ? "text-blue-500"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                            >
                                <Icon
                                    className={`size-5 sm:size-6 mb-1 ${
                                        isActive ? "text-blue-500" : ""
                                    }`}
                                />
                                <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

export default Bar;
