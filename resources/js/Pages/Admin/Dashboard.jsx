import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";

function money(v) {
    return `${Number(v || 0).toLocaleString("fr-FR")} UZS`;
}

function SparkBars({ data = [], field, color = "#2563eb", height = 120 }) {
    const max = Math.max(...data.map((d) => Number(d[field] || 0)), 1);

    return (
        /* Added h-24 on mobile to prevent squashing */
        <div className="h-24 md:h-32 flex items-end gap-0.5 md:gap-1 overflow-hidden px-1">
            {data.map((item, idx) => {
                const value = Number(item[field] || 0);
                const h = Math.max((value / max) * height, 2);
                return (
                    <div
                        key={`${field}-${item.date}-${idx}`}
                        className="flex-1 rounded-t transition-all duration-500 min-w-[4px]"
                        style={{ height: `${h}px`, backgroundColor: color }}
                        title={`${item.date}: ${value.toLocaleString("fr-FR")}`}
                    />
                );
            })}
        </div>
    );
}

export default function Dashboard() {
    const {
        summary = {},
        byType = [],
        statuses = [],
        trend = [],
        recentOrders = [],
    } = usePage().props;
    const statusMax = Math.max(...statuses.map((s) => Number(s.count || 0)), 1);

    const [expandedId, setExpandedId] = useState(null);

    const toggleRow = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        /* padding adjusted for mobile-first */
        <div className="space-y-6 p-0 max-w-7xl mx-auto dark:text-slate-100">
            <Head title="Admin Dashboard" />

            {/* HEADER */}
            <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                    Admin Dashboard
                </h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">
                    Barcha asosiy statistika va diagrammalar
                </p>
            </div>

            {/* SUMMARY GRID - FIXED RESPONSIVE BREAKPOINTS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                <StatCard
                    label="Users"
                    value={summary.users_count}
                    color="gray"
                />
                <StatCard
                    label="Active"
                    value={summary.active_users}
                    color="green"
                />
                <StatCard
                    label="Orders"
                    value={summary.orders_count}
                    color="gray"
                />
                <StatCard
                    label="Paid"
                    value={summary.paid_orders}
                    color="blue"
                />
                {/* Col-span-2 on mobile for money values so they don't cut off */}
                <div className="col-span-2 sm:col-span-1">
                    <StatCard
                        label="Revenue"
                        value={money(summary.revenue_uzs)}
                        color="indigo"
                        isMoney
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <StatCard
                        label="Profit"
                        value={money(summary.profit_uzs)}
                        color="emerald"
                        isMoney
                    />
                </div>
            </div>

            {/* TRENDS - Stack on mobile, side-by-side on LG */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartWrapper
                    title="Kunlik Profit Trend"
                    dateRange={`${trend[0]?.date} - ${trend[trend.length - 1]?.date}`}
                >
                    <SparkBars
                        data={trend}
                        field="profit_uzs"
                        color="#10b981"
                    />
                </ChartWrapper>

                <ChartWrapper
                    title="Kunlik Orders Trend"
                    dateRange={`${trend[0]?.date} - ${trend[trend.length - 1]?.date}`}
                >
                    <SparkBars data={trend} field="orders" color="#3b82f6" />
                </ChartWrapper>
            </div>

            {/* TABLES & LISTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Categories */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 dark:text-slate-100 mb-4 text-sm md:text-base">
                        Yo'nalishlar bo'yicha
                    </h2>
                    <div className="space-y-3">
                        {byType.map((row) => (
                            <div
                                key={row.key}
                                className="border border-gray-100 dark:border-slate-800 rounded-xl p-3 bg-gray-50/50 dark:bg-slate-950/50"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-gray-900 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                                        {row.label}
                                    </p>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-gray-500">
                                        ORD: {row.orders_count}
                                    </span>
                                </div>
                                <div className="mt-2 flex justify-between items-end gap-2">
                                    <div className="flex-1">
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">
                                            Revenue
                                        </p>
                                        <p className="text-xs md:text-sm font-semibold truncate">
                                            {money(row.revenue_uzs)}
                                        </p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">
                                            Profit
                                        </p>
                                        <p className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                                            {money(row.profit_uzs)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Statuses */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 dark:text-slate-100 mb-4 text-sm md:text-base">
                        Order Status
                    </h2>
                    <div className="space-y-4">
                        {statuses.map((s) => {
                            const percent = (
                                (Number(s.count || 0) / statusMax) *
                                100
                            ).toFixed(1);
                            return (
                                <div key={s.status} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-tight">
                                        <span className="text-gray-600 dark:text-slate-400">
                                            {s.status}
                                        </span>
                                        <span className="text-gray-900 dark:text-slate-100">
                                            {s.count}
                                        </span>
                                    </div>
                                    <div className="h-1.5 md:h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RECENT ORDERS TABLE - FOR DESKTOP */}
            <div className="bg-white hidden lg:block dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="font-bold text-gray-900 dark:text-slate-100 text-sm md:text-base">
                        So'nggi buyurtmalar
                    </h2>
                </div>
                <div className="overflow-x-auto w-full">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black text-gray-400 dark:text-slate-500">
                                <tr>
                                    <th className="text-left px-4 md:px-6 py-4">
                                        Type
                                    </th>
                                    <th className="text-left px-4 md:px-6 py-4">
                                        Order
                                    </th>
                                    <th className="text-left px-4 md:px-6 py-4 hidden md:table-cell">
                                        User ID
                                    </th>
                                    <th className="text-left px-4 md:px-6 py-4">
                                        Status
                                    </th>
                                    {/* Restored Sell Price */}
                                    <th className="text-right px-4 md:px-6 py-4">
                                        Sell Price
                                    </th>
                                    <th className="text-right px-4 md:px-6 py-4">
                                        Profit
                                    </th>
                                    <th className="text-right px-4 md:px-6 py-4 hidden sm:table-cell">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {recentOrders.map((o) => (
                                    <tr
                                        key={`${o.type}-${o.id}`}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                    >
                                        <td className="px-4 md:px-6 py-4 font-bold dark:text-slate-300 capitalize text-xs">
                                            {o.type}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-gray-500 dark:text-slate-400 text-xs">
                                            #{o.id}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 hidden md:table-cell dark:text-slate-400">
                                            {o.user_id}
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                                                    o.status === "delivered" ||
                                                    o.status === "paid"
                                                        ? "text-emerald-600 border-emerald-100 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                                                        : o.status ===
                                                            "canceled"
                                                          ? "text-red-500 border-red-100 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20"
                                                          : "text-yellow-500 border-yellow-100 bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/20"
                                                }`}
                                            >
                                                {o.status}
                                            </span>
                                        </td>
                                        {/* Restored Sell Price Data Cell */}
                                        <td className="px-4 md:px-6 py-4 text-right font-medium dark:text-slate-300 text-xs">
                                            {money(o.sell_price)}
                                        </td>
                                        <td
                                            className={`px-4 md:px-6 py-4 text-right font-bold text-xs ${
                                                o.status === "canceled"
                                                    ? "text-red-500 dark:text-red-400"
                                                    : "text-emerald-600 dark:text-emerald-400"
                                            }`}
                                        >
                                            {money(o.profit_base)}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right text-gray-500 dark:text-slate-500 whitespace-nowrap text-[10px] hidden sm:table-cell">
                                            {new Date(
                                                o.created_at,
                                            ).toLocaleDateString("ru-RU")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* --- MOBILE COLLAPSIBLE CARDS (Visible below lg) --- */}
            <div className="lg:hidden grid grid-cols-1 gap-2 divide-y divide-gray-100 dark:divide-slate-800 rounded-lg">
                {recentOrders.map((o) => {
                    const isExpanded = expandedId === o.id;

                    return (
                        <div
                            key={o.id}
                            className={`transition-all duration-300 ease-in-out border-2 rounded-lg ${
                                isExpanded
                                    ? "my-2 mx-1 rounded-2xl border-blue-500 bg-blue-50/30 dark:bg-blue-500/5 shadow-lg shadow-blue-500/10"
                                    : "border-transparent bg-transparent"
                            }`}
                            onClick={() =>
                                setExpandedId(isExpanded ? null : o.id)
                            }
                        >
                            <div className="p-4 bg-gray-200 dark:bg-slate-800 rounded-lg">
                                {/* 1. HEADER SECTION */}
                                <div className="flex justify-between items-start ">
                                    <div className="flex flex-col">
                                        <span
                                            className={`text-[9px] font-black uppercase tracking-widest ${isExpanded ? "text-blue-500" : "text-gray-400"}`}
                                        >
                                            {o.type}
                                        </span>
                                        <span className="text-sm font-black text-gray-900 dark:text-slate-100 mt-1">
                                            #{o.id}
                                        </span>
                                    </div>

                                    <div className="text-right flex flex-col items-end gap-2">
                                        <StatusBadge status={o.status} />
                                        <span
                                            className={`text-sm font-black ${
                                                o.status === "canceled"
                                                    ? "text-red-500"
                                                    : "text-emerald-600 dark:text-emerald-400"
                                            }`}
                                        >
                                            {money(o.profit_base)}
                                        </span>
                                    </div>
                                </div>

                                {/* 2. EXPANDABLE SECTION */}
                                <div
                                    className={`grid transition-all duration-300 ease-in-out ${
                                        isExpanded
                                            ? "grid-rows-[1fr] opacity-100 mt-5"
                                            : "grid-rows-[0fr] opacity-0"
                                    }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="pt-4 border-t border-blue-200/50 dark:border-slate-700/50 grid grid-cols-2 gap-y-4">
                                            <div>
                                                <p className="text-[9px] font-black text-blue-400 dark:text-blue-500 uppercase">
                                                    User ID
                                                </p>
                                                <p className="text-xs font-bold text-gray-700 dark:text-slate-300">
                                                    {o.user_id}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-blue-400 dark:text-blue-500 uppercase">
                                                    Sell Price
                                                </p>
                                                <p className="text-xs font-bold text-gray-700 dark:text-slate-300">
                                                    {money(o.sell_price)}
                                                </p>
                                            </div>
                                            <div className="col-span-2 bg-white/50 dark:bg-slate-950/30 p-2 rounded-lg border border-blue-100 dark:border-slate-800">
                                                <p className="text-[8px] font-black text-gray-400 uppercase">
                                                    Registered Date
                                                </p>
                                                <p className="text-[11px] font-bold text-gray-700 dark:text-slate-300">
                                                    {new Date(
                                                        o.created_at,
                                                    ).toLocaleString("en-EN", {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StatCard({ label, value, color, isMoney }) {
    const colors = {
        gray: "text-gray-900 dark:text-slate-100",
        green: "text-green-600 dark:text-green-400",
        blue: "text-blue-600 dark:text-blue-400",
        indigo: "text-indigo-600 dark:text-indigo-400",
        emerald: "text-emerald-600 dark:text-emerald-400",
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm">
            <p className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider">
                {label}
            </p>
            <p
                className={`font-black mt-0.5 md:mt-1 tracking-tighter truncate ${isMoney ? "text-xs md:text-base" : "text-lg md:text-2xl"} ${colors[color]}`}
            >
                {value || 0}
            </p>
        </div>
    );
}

function ChartWrapper({ title, dateRange, children }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-slate-100 mb-4 text-sm md:text-base">
                {title}
            </h2>
            {children}
            <div className="mt-3 flex justify-between text-[9px] md:text-[10px] font-bold uppercase text-gray-400 dark:text-slate-500">
                <span>{dateRange.split(" - ")[0]}</span>
                <span>{dateRange.split(" - ")[1]}</span>
            </div>
        </div>
    );
}

// Helper component for the status badge to keep code clean
function StatusBadge({ status }) {
    const isSuccess = status === 'delivered' || status === 'paid';
    const isError = status === 'canceled';

    return (
        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
            isSuccess ? 'text-emerald-600 border-emerald-100 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
            isError ? 'text-red-500 border-red-100 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20' :
            'text-yellow-500 border-yellow-100 bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/20'
        }`}>
            {status}
        </span>
    );
}
