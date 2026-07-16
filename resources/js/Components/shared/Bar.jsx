import { Link, usePage } from "@inertiajs/react";
import { ShieldCheck, ShoppingBag, Store, UserCircle, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

function Bar() {
    const { url } = usePage();
    const { t } = useTranslation();
    // bardan olib quyilgan funksiyalar
    // {
    //         id: "vazifalar",
    //         label: "Vazifalar",
    //         icon: ListTodo,
    //         href: "/user-tasks",
    //     },
    // { id: "ruletka", label: "Ruletka", icon: Dices, href: "/user-spin" },

    const navItems = [
        {
            id: "xizmatlar",
            label: `${t("bar.services")}`,
            icon: ShieldCheck,
            href: "/user-services",
        },
        {
            id: "xaridlarim",
            label: `${t("bar.purchases")}`,
            icon: ShoppingBag,
            href: "/user-purchases",
        },
        // {
        //     id: "shop",
        //     label: `${t("bar.shop")}`,
        //     icon: Store,
        //     href: "/shop",
        // },
        {
            id: "balnce_topup",
            label: `${t("bar.balanceTopup")}`,
            icon: Wallet,
            href: "/user-profile/user-balance",
        },
        {
            id: "profil",
            label: `${t("bar.profile")}`,
            icon: UserCircle,
            href: "/user-profile",
        },
    ];

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 dark:border-white/5 bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg transition-colors duration-300 py-0 pb-[env(safe-area-inset-bottom)] rounded-t-3xl`}
        >
            <div className="max-w-7xl mx-auto px-1">
                <div className="grid grid-cols-4 gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            url === item.href ||
                            (item.href !== "/user-profile" &&
                                url.startsWith(item.href + "/"));

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
