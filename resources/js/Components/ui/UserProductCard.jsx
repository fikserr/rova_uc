import UcIcon from "@images/ucMain.webp";
import {
    ArrowRight,
    Coins,
    Crown,
    Lock,
    ShoppingCart,
    Star,
} from "lucide-react";
import { useTranslation } from 'react-i18next'
import { IoDiamondOutline } from "react-icons/io5";

function getProductIcon(product) {
    if (product.type === "uc") return UcIcon;
    if (product.type === "diamond") return IoDiamondOutline;
    if (product.type === "tg" && product.service_type === "stars") return Star;
    if (product.type === "tg" && product.service_type === "premium")
        return Crown;
    return Coins;
}

function getAccent(product) {
    if (product.type === "uc")
        return {
            gradient: "from-blue-500 to-indigo-600",
            soft: "bg-blue-50 dark:bg-blue-500/10",
            text: "text-blue-600 dark:text-blue-400",
            price: "text-blue-600 dark:text-blue-400",
            badge: "bg-blue-500",
            glow: "hover:shadow-blue-100 dark:hover:shadow-blue-900/30",
            iconBg: "bg-blue-100 dark:bg-blue-500/20",
            iconText: "text-blue-600 dark:text-blue-400",
            label: "Pubg Mobile",
        };
    if (product.type === "diamond")
        return {
            gradient: "from-blue-500 to-indigo-600",
            soft: "bg-blue-50 dark:bg-blue-500/10",
            text: "text-blue-600 dark:text-blue-400",
            price: "text-blue-600 dark:text-blue-400",
            badge: "bg-blue-500",
            glow: "hover:shadow-blue-100 dark:hover:shadow-blue-900/30",
            iconBg: "bg-blue-100 dark:bg-blue-500/20",
            iconText: "text-blue-600 dark:text-blue-400",
            label: "Mobile Legends",
        };
    if (product.type === "tg")
        return {
            gradient: "from-blue-500 to-indigo-600",
            soft: "bg-blue-50 dark:bg-blue-500/10",
            text: "text-blue-600 dark:text-blue-400",
            price: "text-blue-600 dark:text-blue-400",
            badge: "bg-blue-500",
            glow: "hover:shadow-blue-100 dark:hover:shadow-blue-900/30",
            iconBg: "bg-blue-100 dark:bg-blue-500/20",
            iconText: "text-blue-600 dark:text-blue-400",
        };
    return {
        gradient: "from-slate-400 to-slate-500",
        soft: "bg-slate-50 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        price: "text-slate-700 dark:text-slate-300",
        badge: "bg-slate-500",
        glow: "",
        iconBg: "bg-slate-100 dark:bg-slate-700",
        iconText: "text-slate-500",
        label: "",
    };
}

export default function UserProductCard({ product, onClick }) {
    const { t } = useTranslation();
    const Icon = getProductIcon(product);
    const accent = getAccent(product);
    const isActive = product.is_active !== false;

    const formattedPrice = Number(Math.floor(product.sell_price))
        .toLocaleString("fr-FR", { maximumFractionDigits: 4 })
        .replace(/\s/g, ",");

    const currency =
        product.sell_currency === "USD" ? "$" : product.sell_currency;

    return (
        <button
            onClick={isActive ? onClick : undefined}
            disabled={!isActive}
            className={`
                group relative w-full rounded-2xl text-left transition-all duration-300 overflow-hidden
                border
                ${
                    isActive
                        ? `bg-white dark:bg-slate-800/90 border-slate-100 dark:border-slate-700/60
                       shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${accent.glow} cursor-pointer`
                        : "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 cursor-not-allowed opacity-60 grayscale"
                }
            `}
        >
            {/* Active: top gradient accent bar */}
            {isActive && (
                <div
                    className={`h-1 w-full bg-linear-to-r ${accent.gradient}`}
                />
            )}

            <div className="p-4 sm:p-5">
                {/* Header row */}
                <div className="flex items-center gap-3 mb-4">
                    {/* Icon */}
                    <div
                        className={`relative size-12 rounded-2xl flex items-center justify-center shrink-0 ${isActive ? accent.iconBg : "bg-slate-200 dark:bg-slate-700"}`}
                    >
                        {typeof Icon === "string" ? (
                            <img
                                src={Icon}
                                alt={product.title}
                                className="w-8 h-8 object-contain"
                            />
                        ) : (
                            <Icon
                                className={`size-5 ${isActive ? accent.iconText : "text-slate-400"}`}
                            />
                        )}

                        {/* Lock overlay for inactive */}
                        {!isActive && (
                            <div className="absolute inset-0 rounded-2xl bg-slate-300/60 dark:bg-slate-600/60 flex items-center justify-center">
                                <Lock className="size-4 text-slate-500 dark:text-slate-400" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3
                            className={`text-sm sm:text-base font-bold truncate leading-tight ${isActive ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-500"}`}
                        >
                            {product.title}
                        </h3>
                        <p
                            className={`text-xs mt-0.5 truncate ${isActive ? "text-slate-400 dark:text-slate-500" : "text-slate-400 dark:text-slate-600"}`}
                        >
                            {accent.label}
                        </p>
                    </div>

                    {/* Inactive badge */}
                    {!isActive && (
                        <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                            Mavjud emas
                        </span>
                    )}
                </div>

                {/* Price + CTA row */}
                <div
                    className={`flex flex-col items-start gap-2 justify-between rounded-xl px-4 py-3 ${isActive ? accent.soft : "bg-slate-200/50 dark:bg-slate-700/30"}`}
                >
                    <div>
                        <p
                            className={`text-xs font-medium mb-0.5 ${isActive ? "text-slate-400 dark:text-slate-500" : "text-slate-400"}`}
                        >
                            {t('others.price')}
                        </p>
                        <p
                            className={`text-base m:text-xl font-bold leading-none ${isActive ? accent.price : "text-slate-400 dark:text-slate-500"}`}
                        >
                            {formattedPrice}
                            <span className="text-xs lg:text-sm font-bold ml-1">
                                {currency}
                            </span>
                        </p>
                    </div>

                    {isActive ? (
                        <div
                            className={`flex items-center gap-2 px-3 h-9 rounded-xl ${accent.badge} text-white text-xs font-bold shadow-sm transition-all group-hover:scale-105`}
                        >
                            <ShoppingCart className="size-3.5" />
                            <span className='text-xs lg:text-base' >{t('others.buy')}</span>
                            <ArrowRight className="hidden lg:block size-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 text-xs font-bold">
                            <Lock className="size-3.5" />
                            <span>Yopiq</span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}
