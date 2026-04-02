import { Head, usePage } from "@inertiajs/react";
import { CheckCircle, Clock, Filter, Package, Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";

function UserPurchases() {
    const { purchases = [], stats = {} } = usePage().props;
    const [filterStatus, setFilterStatus] = useState("all");

    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
            case "paid":
                return "bg-emerald-100 text-emerald-700";
            case "pending":
                return "bg-amber-100 text-amber-700";
            case "canceled":
                return "bg-rose-100 text-rose-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "delivered":
                return "Bajarildi";
            case "paid":
                return "To'langan";
            case "pending":
                return "Kutilmoqda";
            case "canceled":
                return "Bekor qilingan";
            default:
                return status;
        }
    };

    const filteredPurchases = useMemo(() => {
        if (filterStatus === "all") {
            return purchases;
        }

        return purchases.filter((purchase) => purchase.status === filterStatus);
    }, [purchases, filterStatus]);

    const rotateFilter = () => {
        setFilterStatus((prev) => {
            if (prev === "all") return "pending";
            if (prev === "pending") return "paid";
            if (prev === "paid") return "delivered";
            if (prev === "delivered") return "canceled";
            return "all";
        });
    };

    const formatDateTime = (value) => {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);

        return date.toLocaleString("uz-UZ");
    };

    return (
        <div className="min-h-[calc(100vh-140px)] bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 px-4 py-6 pb-24 lg:pb-8">
            <Head title="Mening Xaridlarim" />
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:text-white">
                        Mening xaridlarim
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Barcha buyurtmalaringiz tarixi</p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <ShoppingBag className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.total ?? 0}</div>
                            <div className="text-xs sm:text-sm text-blue-100">Jami xarid</div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <CheckCircle className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.completed ?? 0}</div>
                            <div className="text-xs sm:text-sm text-emerald-100">Bajarilgan</div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-violet-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <Package className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {Number(stats.total_spent ?? 0).toLocaleString("fr-FR")}
                            </div>
                            <div className="text-xs sm:text-sm text-violet-100">{stats.currency ?? "UZS"} sarflangan</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-2xl shadow-md p-4 mb-6 border border-slate-100 dark:border-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Qidiruv keyin qo'shiladi"
                                disabled
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-0 opacity-60 cursor-not-allowed dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <button
                            className="bg-slate-50 dark:bg-slate-600 p-3 rounded-xl hover:bg-slate-100 transition-colors hover:dark:bg-slate-500"
                            onClick={rotateFilter}
                            title={`Filter: ${filterStatus}`}
                        >
                            <Filter className="size-5 text-slate-600 dark:text-white" />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredPurchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-2xl shadow-md dark:text-white hover:shadow-lg transition-shadow p-5 sm:p-6 border border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shrink-0">
                                        <ShoppingBag className="size-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 dark:text-white">{purchase.title}</h3>
                                        <p className="text-slate-600 text-sm mb-2 dark:text-slate-300">{purchase.amount}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-slate-900 mb-2 dark:text-white">
                                        {Number(purchase.price ?? 0).toLocaleString("fr-FR")} {purchase.currency ?? "UZS"}
                                    </div>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                            purchase.status,
                                        )}`}
                                    >
                                        {getStatusText(purchase.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-300">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-300">Buyurtma ID:</span>
                                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{purchase.id}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-slate-500 dark:text-slate-300">Hisob:</span>
                                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{purchase.target ?? "-"}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-slate-500 dark:text-slate-300">Buyurtma sanasi:</span>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-100">
                                        <Clock className="size-3" />
                                        <span>{formatDateTime(purchase.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredPurchases.length === 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-slate-100">
                        <div className="bg-slate-100 size-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="size-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Xarid topilmadi</h3>
                        <p className="text-slate-600">Xaridlaringiz shu sahifada ko'rinadi</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserPurchases;

