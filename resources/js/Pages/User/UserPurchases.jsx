import UserLayout from "@/Components/Layout/UserLayout";
import { Head } from "@inertiajs/react";
import {
    CheckCircle,
    Clock,
    Filter,
    Package,
    Search,
    ShoppingBag,
} from "lucide-react";
import { useState } from "react";

function UserPurchases() {
    const [filterStatus, setFilterStatus] = useState("all");

    const purchases = [
        {
            id: "ORD-2025-001",
            title: "PUBG MOBILE UC",
            amount: "1800 UC",
            price: "$25.00",
            date: "20 Yanvar 2026",
            time: "14:30",
            status: "completed",
            playerId: "5234567890",
        },
        {
            id: "ORD-2025-002",
            title: "Telegram Premium",
            amount: "1 oylik obuna",
            price: "$5.00",
            date: "18 Yanvar 2026",
            time: "09:15",
            status: "completed",
            playerId: "@safarov_sh",
        },
        {
            id: "ORD-2025-003",
            title: "Mobile Legends Diamond",
            amount: "500 Diamond",
            price: "$15.00",
            date: "15 Yanvar 2026",
            time: "18:45",
            status: "completed",
            playerId: "1234567890",
        },
        {
            id: "ORD-2025-004",
            title: "Telegram Stars",
            amount: "1000 Stars",
            price: "$12.00",
            date: "12 Yanvar 2026",
            time: "11:20",
            status: "completed",
            playerId: "@safarov_sh",
        },
        {
            id: "ORD-2025-005",
            title: "PUBG MOBILE UC",
            amount: "600 UC",
            price: "$10.00",
            date: "08 Yanvar 2026",
            time: "16:00",
            status: "completed",
            playerId: "5234567890",
        },
        {
            id: "ORD-2025-006",
            title: "Mobile Legends Diamond",
            amount: "1000 Diamond",
            price: "$28.00",
            date: "05 Yanvar 2026",
            time: "13:30",
            status: "completed",
            playerId: "1234567890",
        },
    ];

    const stats = {
        total: purchases.length,
        completed: purchases.filter((p) => p.status === "completed").length,
        totalSpent: purchases.reduce(
            (sum, p) => sum + parseFloat(p.price.replace("$", "")),
            0,
        ),
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-emerald-100 text-emerald-700";
            case "pending":
                return "bg-amber-100 text-amber-700";
            case "failed":
                return "bg-rose-100 text-rose-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "completed":
                return "Bajarildi";
            case "pending":
                return "Kutilmoqda";
            case "failed":
                return "Bekor qilindi";
            default:
                return status;
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 px-4 py-6 pb-24 lg:pb-8">
            <Head title="User Purchases" />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:text-white">
                        Mening xaridlarim
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Barcha buyurtmalaringiz tarixi
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <ShoppingBag className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {stats.total}
                            </div>
                            <div className="text-xs sm:text-sm text-blue-100">
                                Jami xarid
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <CheckCircle className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {stats.completed}
                            </div>
                            <div className="text-xs sm:text-sm text-emerald-100">
                                Bajarilgan
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-violet-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <Package className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                ${stats.totalSpent}
                            </div>
                            <div className="text-xs sm:text-sm text-violet-100">
                                Sarflangan
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-2xl shadow-md p-4 mb-6 border border-slate-100 dark:border-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400 " />
                            <input
                                type="text"
                                placeholder="Xaridlarni qidirish..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 outline-none dark:bg-slate-700 dark:focus:ring-blue-500 dark:text-white"
                            />
                        </div>
                        <button className="bg-slate-50 dark:bg-slate-600 p-3 rounded-xl hover:bg-slate-100 transition-colors hover:dark:bg-slate-500">
                            <Filter className="size-5 text-slate-600 dark:text-white" />
                        </button>
                    </div>
                </div>

                {/* Purchases List */}
                <div className="space-y-4">
                    {purchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-2xl shadow-md dark:text-white hover:shadow-lg transition-shadow p-5 sm:p-6 border border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shrink-0">
                                        <ShoppingBag className="size-6 text-white " />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 dark:text-white">
                                            {purchase.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-2 dark:text-slate-300 ">
                                            {purchase.amount}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-slate-900 mb-2 dark:text-white">
                                        {purchase.price}
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
                                    <span className="text-slate-500 dark:text-slate-300">
                                        Buyurtma ID:
                                    </span>
                                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                                        {purchase.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-slate-500 dark:text-slate-300">
                                        O'yinchi ID:
                                    </span>
                                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                                        {purchase.playerId}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-slate-500 dark:text-slate-300">
                                        Buyurtma sanasi:
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-100">
                                        <Clock className="size-3" />
                                        <span>
                                            {purchase.date} • {purchase.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {purchases.length === 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-slate-100">
                        <div className="bg-slate-100 size-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="size-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Hali xarid qilmadingiz
                        </h3>
                        <p className="text-slate-600">
                            Birinchi xaridingizni qiling va u bu yerda ko'rinadi
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

UserPurchases.layout = (page) => <UserLayout>{page}</UserLayout>;

export default UserPurchases;
