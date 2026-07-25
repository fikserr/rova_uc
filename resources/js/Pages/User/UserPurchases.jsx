import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    CheckCircle,
    Clock,
    Filter,
    Package,
    Search,
    ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { imgFallback } from "../../Utils/ImgProxy";
import {
    productLabel,
    resolveProductImage,
} from "../../Utils/productOverrides";

function UserPurchases() {
    const { t } = useTranslation();
    const { purchases: initPurchases = [], stats: initStats = {} } =
        usePage().props;
    const [purchases, setPurchases] = useState(initPurchases);
    const [stats, setStats] = useState(initStats);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const intervalRef = useRef(null);

    useEffect(() => {
        const refresh = async () => {
            try {
                const res = await axios.get("/user-purchases/data");
                setPurchases(res.data.purchases ?? []);
                setStats(res.data.stats ?? {});
            } catch (_) {}
        };

        intervalRef.current = setInterval(refresh, 5000);
        window.addEventListener("focus", refresh);
        return () => {
            clearInterval(intervalRef.current);
            window.removeEventListener("focus", refresh);
        };
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
            case "paid":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "completed":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "processing":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
            case "pending":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case "canceled":
            case "failed":
                return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
            default:
                return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "delivered":
                return t("purchases.status.delivered");
            case "paid":
                return t("purchases.status.paid");
            case "pending":
                return t("purchases.status.pending");
            case "canceled":
                return t("purchases.status.canceled");
            default:
                return status;
        }
    };

    const filteredPurchases = useMemo(() => {
        let result = purchases;

        if (filterStatus !== "all") {
            result = result.filter((p) => p.status === filterStatus);
        }

        const q = searchQuery.trim().toLowerCase();
        if (q) {
            result = result.filter((p) => {
                const label = productLabel(p.title, p.amount) ?? "";
                const haystack = [
                    p.title,
                    p.amount,
                    label,
                    p.target,
                    p.id,
                    p.invoice,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(q);
            });
        }

        return result;
    }, [purchases, filterStatus, searchQuery]);

    const formatDateTime = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleString("uz-UZ");
    };

    return (
        <div className="min-h-[calc(100vh-140px)] px-4 py-6 pb-24 lg:pb-8">
            <Head title={t("purchases.page_title")} />

            <div className="max-w-4xl mx-auto">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:text-white">
                        {t("purchases.title")}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {t("purchases.subtitle")}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <ShoppingBag className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {stats.total ?? 0}
                            </div>
                            <div className="text-xs sm:text-sm text-blue-100">
                                {t("purchases.stats.total")}
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <CheckCircle className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {stats.completed ?? 0}
                            </div>
                            <div className="text-xs sm:text-sm text-emerald-100">
                                {t("purchases.stats.completed")}
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-violet-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <Package className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {Number(stats.total_spent ?? 0).toLocaleString(
                                    "fr-FR",
                                )}
                            </div>
                            <div className="text-xs sm:text-sm text-violet-100">
                                {stats.currency ?? "UZS"}{" "}
                                {t("purchases.stats.spent")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search + Filter bar */}
                <div className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-2xl shadow-md p-4 mb-6 border border-slate-100 dark:border-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("purchases.search_placeholder")}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 dark:text-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                        <div className="relative shrink-0">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 dark:text-slate-300 pointer-events-none" />
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="appearance-none bg-slate-50 dark:bg-slate-600 dark:text-white pl-9 pr-8 py-3 rounded-xl text-sm font-medium hover:bg-slate-100 hover:dark:bg-slate-500 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="all">
                                    {t("purchases.status.all")}
                                </option>
                                <option value="pending">
                                    {t("purchases.status.pending")}
                                </option>
                                <option value="completed">
                                    {t("purchases.status.delivered")}
                                </option>
                                <option value="canceled">
                                    {t("purchases.status.canceled")}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Purchase cards */}
                <div className="space-y-4">
                    {filteredPurchases.map((purchase) => {
                        // purchase.title = raw game name (e.g. "Mobile Legends")
                        // purchase.amount = raw product name (e.g. "Mobilelegend - 5 Diamond")
                        // Both map directly onto the keys/patterns in productOverrides.js
                        const displayLabel = productLabel(
                            purchase.title,
                            purchase.amount,
                        );
                        const productImage = resolveProductImage(
                            purchase.title,
                            { name: purchase.amount },
                        );

                        return (
                            <div
                                key={purchase.id}
                                className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-2xl shadow-md dark:text-white hover:shadow-lg transition-shadow p-5 sm:p-6 border border-slate-100 dark:border-slate-700"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-linear-to-br from-blue-500 to-indigo-500 p-3 rounded-xl shrink-0 size-12 overflow-hidden flex items-center justify-center">
                                            {productImage ? (
                                                <img
                                                    src={productImage}
                                                    alt={displayLabel}
                                                    className="w-full h-full object-cover"
                                                    onError={imgFallback}
                                                />
                                            ) : (
                                                <ShoppingBag className="size-6 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm lg:text-lg font-bold text-slate-900 mb-1 truncate dark:text-white">
                                                {purchase.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm mb-2 dark:text-slate-300 truncate">
                                                {displayLabel}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm lg:text-xl font-bold text-slate-900 mb-2 dark:text-white">
                                            {Number(
                                                purchase.price ?? 0,
                                            ).toLocaleString("fr-FR")}{" "}
                                            {purchase.currency ?? "UZS"}
                                        </div>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(purchase.status)}`}
                                        >
                                            {getStatusText(purchase.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-3 mt-0 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-300">
                                            {t("purchases.order_id")}:
                                        </span>
                                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                                            {purchase.id}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-300">
                                            {t("purchases.account")}:
                                        </span>
                                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                                            {purchase.target ?? "-"}
                                        </span>
                                    </div>
                                    {purchase.invoice && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-300">
                                                Invoice:
                                            </span>
                                            <span className="font-mono font-semibold text-xs text-slate-900 dark:text-slate-100">
                                                {purchase.invoice}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-300">
                                            {t("purchases.order_date")}:
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-100">
                                            <Clock className="size-3" />
                                            <span>
                                                {formatDateTime(
                                                    purchase.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {filteredPurchases.length === 0 && (
                    <div className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-slate-100 dark:border-slate-700">
                        <div className="bg-slate-100 dark:bg-slate-700 size-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="size-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {t("purchases.empty_title")}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            {t("purchases.empty_desc")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserPurchases;
