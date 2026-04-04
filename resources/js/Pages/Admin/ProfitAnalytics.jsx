import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";

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
        <div className="space-y-6 p-4 md:p-0">
            <Head title="Profit Analytics" />

            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Profit Analytics
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Tanlangan davr: {filters?.from} dan {filters?.to} gacha
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => applyPreset("today")}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                        Bugun
                    </button>
                    <button
                        onClick={() => applyPreset("7d")}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                        7 kun
                    </button>
                    <button
                        onClick={() => applyPreset("30d")}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                        30 kun
                    </button>
                    <button
                        onClick={() => applyPreset("90d")}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                        90 kun
                    </button>
                </div>

                <form
                    onSubmit={submitCustomRange}
                    className="flex flex-col md:flex-row gap-3"
                >
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Qo'llash
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Jami Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {summary?.orders_count || 0}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Paid/Delivered</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {summary?.paid_orders || 0}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Tushum</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {formatMoney(summary?.revenue_uzs)}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Xarajat</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                        {formatMoney(summary?.cost_uzs)}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Sof Foyda</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {formatMoney(summary?.profit_uzs)}
                    </p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Yo'nalishlar bo'yicha alohida
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="text-left px-4 py-3">Yo'nalish</th>
                                <th className="text-left px-4 py-3">Orders</th>
                                <th className="text-left px-4 py-3">Paid</th>
                                <th className="text-left px-4 py-3">Tushum</th>
                                <th className="text-left px-4 py-3">Xarajat</th>
                                <th className="text-left px-4 py-3">Foyda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(byType || []).map((row) => (
                                <tr key={row.key} className="border-t border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {row.label}
                                    </td>
                                    <td className="px-4 py-3">{row.orders_count}</td>
                                    <td className="px-4 py-3">{row.paid_orders}</td>
                                    <td className="px-4 py-3">
                                        {formatMoney(row.revenue_uzs)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatMoney(row.cost_uzs)}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-emerald-600">
                                        {formatMoney(row.profit_uzs)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
