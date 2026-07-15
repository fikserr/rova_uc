import { usePage } from '@inertiajs/react'
import { Crown, Diamond, Edit2, Eye, Gamepad2, Star, Trash2, TrendingDown, TrendingUp } from "lucide-react"

function ProductCard({ product, onEdit, onDelete, cardFor }) {
    const { currency_rates: currencyRates = {} } = usePage().props;

    const getRateToBase = (currencyCode) => {
        const normalizedCode = String(currencyCode ?? "UZS").trim().toUpperCase();
        if (normalizedCode === "UZS") return 1;
        return Number(currencyRates[normalizedCode] ?? 0);
    };

    const calculateProfit = (sellPrice, costPrice, sellCurrency, costCurrency) => {
        const sell = Number(sellPrice) || 0;
        const cost = Number(costPrice) || 0;
        const sellInUZS = sell * getRateToBase(sellCurrency);
        const costInUZS = cost * getRateToBase(costCurrency);
        return sellInUZS - costInUZS;
    };

    const profit = Number(
        product.profit_base ?? calculateProfit(
            product.sell_price,
            product.cost_price,
            product.sell_currency,
            product.cost_currency
        )
    );

    const isProfitable = profit >= 0;

    // Card accent color based on type
    const accent = {
        uc:       { gradient: "from-blue-500 to-indigo-600",   light: "bg-blue-50 dark:bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",   border: "border-blue-100 dark:border-blue-800/50",   activeBorder: "border-blue-300 dark:border-blue-600/60" },
        diamonds: { gradient: "from-purple-500 to-violet-600", light: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-100 dark:border-purple-800/50", activeBorder: "border-purple-300 dark:border-purple-600/60" },
        services: { gradient: "from-amber-400 to-orange-500",  light: "bg-amber-50 dark:bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400",  border: "border-amber-100 dark:border-amber-800/50",  activeBorder: "border-amber-300 dark:border-amber-600/60" },
    }[cardFor] ?? { gradient: "from-slate-400 to-slate-500", light: "bg-slate-50 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", activeBorder: "border-slate-300 dark:border-slate-600" };

    // Amount label + value
    const amountLabel =
        cardFor === "uc" ? "UC Amount" :
        cardFor === "diamonds" ? "Diamond Amount" :
        product.service_type === "stars" ? "Stars Amount" : "Premium (oy)";

    const amountValue =
        cardFor === "uc" ? product.uc_amount :
        cardFor === "diamonds" ? product.diamonds :
        product.value;

    // Icon
    const CardIcon =
        cardFor === "uc" ? Gamepad2 :
        cardFor === "diamonds" ? Diamond :
        product.service_type === "premium" ? Crown : Star;

    return (
        <div className={`
            relative bg-white dark:bg-slate-800/90 rounded-2xl border-2 transition-all duration-200
            hover:shadow-lg hover:-translate-y-0.5
            ${product.is_active
                ? `${accent.activeBorder} shadow-sm`
                : "border-slate-200 dark:border-slate-700 opacity-60"
            }
        `}>

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Icon */}
                        <div className={`size-10 rounded-xl bg-linear-to-br ${accent.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                            <CardIcon className="size-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white capitalize truncate leading-tight">
                                {product.title}
                            </h4>
                            {/* Service type badge */}
                            {product.service_type === "premium" && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mt-0.5">
                                    <Crown className="size-3" /> Premium
                                </span>
                            )}
                            {product.service_type === "stars" && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mt-0.5">
                                    <Star className="size-3" /> Stars
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Active status */}
                    <div className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                        product.is_active
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}>
                        {product.is_active ? "Aktiv" : "Noaktiv"}
                    </div>
                </div>

                {/* Stats */}
                <div className={`rounded-xl p-3 space-y-2.5 mb-4 ${accent.light} border ${accent.border}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{amountLabel}</span>
                        <span className={`text-xs font-bold ${accent.text}`}>
                            {amountValue ?? "—"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sell Price</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {Number(product.sell_price).toLocaleString("fr-FR")} {product.sell_currency || "UZS"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cost Price</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {Number(product.cost_price).toLocaleString("fr-FR")} {product.cost_currency}
                        </span>
                    </div>

                    {/* Profit row — highlighted */}
                    <div className={`flex items-center justify-between pt-2 border-t ${accent.border}`}>
                        <div className="flex items-center gap-1">
                            {isProfitable
                                ? <TrendingUp className="size-3.5 text-emerald-500" />
                                : <TrendingDown className="size-3.5 text-rose-500" />
                            }
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Foyda</span>
                        </div>
                        <span className={`text-xs font-bold ${
                            isProfitable
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                        }`}>
                            {isProfitable ? "+" : ""}{profit.toLocaleString("fr-FR")} UZS
                        </span>
                    </div>

                    {/* View count row */}
                    {product.view_count !== undefined && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <Eye className="size-3.5 text-slate-400" />
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ko'rishlar</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {Number(product.view_count).toLocaleString("fr-FR")}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(product)}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all active:scale-95
                            ${accent.light} ${accent.text} hover:opacity-80 border ${accent.border}`}
                    >
                        <Edit2 className="size-3.5" />
                        Tahrirlash
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all active:scale-95
                            bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50 hover:opacity-80"
                    >
                        <Trash2 className="size-3.5" />
                        O'chirish
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
