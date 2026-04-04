import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { IoStatsChartOutline } from "react-icons/io5";

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("fr-FR")} UZS`;
}

export default function ProfitAnalytics() {
    const { filters, summary, byType } = usePage().props;
    const [from, setFrom] = useState(filters?.from || "");
    const [to, setTo] = useState(filters?.to || "");

    const applyPreset = (preset) => {
        router.get(
            "/profit-analytics",
            { preset },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submitCustomRange = (e) => {
        e.preventDefault();
        router.get(
            "/profit-analytics",
            { from, to, preset: filters?.preset || "30d" },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <div className="space-y-6 p-0 md:p-4 lg:p-0 max-w-7xl mx-auto min-h-screen bg-transparent dark:text-slate-100">
            <Head title="Profit Analytics" />

            {/* HEADER */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <IoStatsChartOutline className="text-blue-600 dark:text-blue-400" />
                    Profit Analytics
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                    Tanlangan davr:{" "}
                    <span className="font-medium text-gray-700 dark:text-slate-200">
                        {filters?.from}
                    </span>{" "}
                    dan{" "}
                    <span className="font-medium text-gray-700 dark:text-slate-200">
                        {filters?.to}
                    </span>{" "}
                    gacha
                </p>
            </div>

            {/* FILTERS SECTION */}
            <div className="bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm backdrop-blur-md space-y-4">
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {["today", "7d", "30d", "90d"].map((p) => (
                        <button
                            key={p}
                            onClick={() => applyPreset(p)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                ${
                                    filters?.preset === p
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                                }`}
                        >
                            {p === "today"
                                ? "Bugun"
                                : p === "7d"
                                  ? "7 kun"
                                  : p === "30d"
                                    ? "30 kun"
                                    : "90 kun"}
                        </button>
                    ))}
                </div>

                <form
                    onSubmit={submitCustomRange}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-end gap-3"
                >
                    <div className="space-y-1 flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 ml-1">
                            Dan
                        </label>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-slate-100 color-scheme-dark"
                        />
                    </div>
                    <div className="space-y-1 flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 ml-1">
                            Gacha
                        </label>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-slate-100 color-scheme-dark"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-blue-600 text-white font-semibold hover:bg-gray-800 dark:hover:bg-blue-500 transition-all active:scale-95"
                    >
                        Qo'llash
                    </button>
                </form>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                <StatCard
                    label="Jami Orders"
                    value={summary?.orders_count}
                    sub="Buyurtmalar"
                    color="blue"
                />
                <StatCard
                    label="Paid"
                    value={summary?.paid_orders}
                    sub="Muvaffaqiyatli"
                    color="indigo"
                />
                <StatCard
                    label="Tushum"
                    value={formatMoney(summary?.revenue_uzs)}
                    color="blue"
                    isMoney
                />
                <StatCard
                    label="Xarajat"
                    value={formatMoney(summary?.cost_uzs)}
                    color="amber"
                    isMoney
                />
                <StatCard
                    label="Sof Foyda"
                    value={formatMoney(summary?.profit_uzs)}
                    color="emerald"
                    isMoney
                />
            </div>

            {/* BREAKDOWN BY TYPE */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700/70 bg-gray-50/50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                        Yo'nalishlar bo'yicha
                    </h2>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="text-left px-6 py-4">
                                    Yo'nalish
                                </th>
                                <th className="text-center px-6 py-4">
                                    Orders
                                </th>
                                <th className="text-center px-6 py-4">Paid</th>
                                <th className="text-right px-6 py-4">Tushum</th>
                                <th className="text-right px-6 py-4">
                                    Xarajat
                                </th>
                                <th className="text-right px-6 py-4">Foyda</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                            {(byType || []).map((row) => (
                                <tr
                                    key={row.key}
                                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-200">
                                        {row.label}
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium dark:text-slate-300">
                                        {row.orders_count}
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-emerald-600 dark:text-emerald-400">
                                        {row.paid_orders}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium dark:text-slate-300">
                                        {formatMoney(row.revenue_uzs)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-amber-600 dark:text-amber-500">
                                        {formatMoney(row.cost_uzs)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-500/5">
                                        {formatMoney(row.profit_uzs)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden divide-y divide-gray-100 dark:divide-slate-700/70">
                    {(byType || []).map((row) => (
                        <div key={row.key} className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">
                                    {row.label}
                                </h3>
                                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-1 rounded-md font-bold uppercase">
                                    {row.paid_orders} PAID
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">
                                        Tushum
                                    </p>
                                    <p className="font-semibold text-gray-800 dark:text-slate-200">
                                        {formatMoney(row.revenue_uzs)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">
                                        Xarajat
                                    </p>
                                    <p className="font-semibold text-amber-600 dark:text-amber-500">
                                        {formatMoney(row.cost_uzs)}
                                    </p>
                                </div>
                                <div className="col-span-2 bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-xl flex justify-between items-center border border-emerald-100 dark:border-emerald-500/20">
                                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">
                                        Sof Foyda
                                    </p>
                                    <p className="font-black text-emerald-700 dark:text-emerald-300">
                                        {formatMoney(row.profit_uzs)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, icon, color, isMoney }) {
    const theme = {
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
        indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400",
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
        emerald:
            "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 leading-tight">
                    {label}
                </p>
                {icon && (
                    <span
                        className={`p-1.5 rounded-lg text-sm ${theme[color]}`}
                    >
                        {icon}
                    </span>
                )}
            </div>
            <div className="mt-2">
                <p
                    className={`font-black tracking-tighter ${isMoney ? "text-lg sm:text-xl" : "text-2xl"} ${isMoney ? theme[color].split(" ")[0] : "text-gray-900 dark:text-slate-100"}`}
                >
                    {value || 0}
                </p>
                {sub && (
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}
