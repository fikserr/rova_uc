import { Link, usePage } from "@inertiajs/react"
import { AnimatePresence, motion } from "framer-motion"
import { ShieldCheck, ShoppingBag, UserCircle, Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

function Bar() {
    const { url } = usePage();
    const { t } = useTranslation();

    const [inputFocused, setInputFocused] = useState(false);

    useEffect(() => {
        const isTextField = (el) =>
            el &&
            (el.tagName === "INPUT" ||
                el.tagName === "TEXTAREA" ||
                el.isContentEditable);

        const onFocusIn = (e) => {
            if (isTextField(e.target)) setInputFocused(true);
        };
        const onFocusOut = (e) => {
            if (isTextField(e.target)) setInputFocused(false);
        };

        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("focusout", onFocusOut);
        return () => {
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("focusout", onFocusOut);
        };
    }, []);

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
        <AnimatePresence>
            {!inputFocused && (
                <motion.nav
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 dark:border-white/5 bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg py-0 pb-[env(safe-area-inset-bottom)] rounded-t-3xl"
                >
                    <div className="max-w-7xl mx-auto px-1">
                        <div className="grid grid-cols-4 gap-1 p-2">
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
                                        className="relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl"
                                    >
                                        {/* Animated active pill background */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabBackground"
                                                className="absolute inset-0 bg-blue-500 rounded-2xl -z-10"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 35,
                                                }}
                                            />
                                        )}

                                        <Icon
                                            className={`size-5 sm:size-6 mb-1 z-10 transition-colors duration-200 ${
                                                isActive
                                                    ? "text-white"
                                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            }`}
                                        />
                                        <span
                                            className={`text-[10px] sm:text-xs font-medium truncate w-full text-center z-10 transition-colors duration-200 ${
                                                isActive
                                                    ? "text-white"
                                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}

export default Bar;