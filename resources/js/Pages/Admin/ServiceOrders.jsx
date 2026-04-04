import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { IoCopyOutline } from "react-icons/io5";

const statusClass = {
    paid: "bg-emerald-100 text-emerald-700",
    delivered: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    canceled: "bg-rose-100 text-rose-700",
};

function formatAmount(value, currency) {
    return `${Number(value ?? 0).toLocaleString("fr-FR")} ${currency ?? ""}`;
}

function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("ru-RU");
}

export default function ServiceOrders() {
    const { orders = [] } = usePage().props;
    const [copiedRow, setCopiedRow] = useState(null);
    const [markedRaw, setMarkedRaw] = useState(null);

    const handleCopy = async (userId, rowId) => {
        if (!userId) return;
        await navigator.clipboard.writeText(userId);
        setCopiedRow(rowId);
        setTimeout(() => setCopiedRow(null), 1300); // 1.5 seconds
    };

    const toggleRow = (id) => {
        setMarkedRaw((prev) => (prev === id ? null : id));
    };

    const setStatus = (orderId, status) => {
        router.post(
            "/orders/status",
            {
                order_type: "service",
                order_id: orderId,
                status,
            },
            { preserveScroll: true },
        );
    };

    console.log(orders);


    return (
        <div className="space-y-6 p-0  ">
            <Head title="Service Orders" />
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Service Orders
                </h1>
                <p className="text-sm text-gray-500 mt-1 dark:text-white/60">
                    Jami: {orders.length} ta
                </p>
            </div>

            {/* --- DESKTOP VIEW (Visible on lg and up) --- */}
            <div className="hidden xl:block overflow-x-auto bg-white rounded-t-xl border border-gray-200 dark:bg-slate-900 dark:border-gray-700">
                <table className="min-w-full text-sm dark:bg-slate-900">
                    <thead className="bg-gray-50 text-gray-600 dark:bg-slate-900 dark:text-gray-50 ">
                        <tr className="font-mono">
                            <th className="text-left px-4 py-3">ID</th>
                            <th className="text-left px-4 py-3">User</th>
                            <th className="text-left px-4 py-3">Mahsulot</th>
                            <th className="text-left px-4 py-3">TG Account</th>
                            <th className="text-left px-4 py-3">Narx</th>
                            <th className="text-left px-4 py-3">Foyda (UZS)</th>
                            <th className="text-left px-4 py-3">Status</th>
                            <th className="text-left px-4 py-3">Amallar</th>
                            <th className="text-left px-4 py-3">Sana</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o, index) => (
                            <tr
                                key={o.id}
                                onClick={() => setMarkedRaw(o.id)}
                                className={`
        cursor-pointer transition-all hover:border-2 border-t-2 border-blue-700  hover:border-blue-700
        ${o.id === markedRaw ? "border-2  shadow-md" : "border-transparent"}
        ${o.status === "canceled" ? "bg-rose-50 dark:bg-rose-950/30" : o.status === "delivered" ? "bg-emerald-50 dark:bg-emerald-950/35" : "bg-yellow-50 dark:bg-yellow-950/30"}
        hover:bg-opacity-80
        `}
                            >
                                <td className="px-4 py-3 font-semibold font-mono  dark:text-slate-100">
                                    #{o.id}
                                </td>
                                <td className="px-4 py-3 text-xs dark:text-slate-100">
                                    <div>{o.username || "-"}</div>
                                    <div className="text-xs text-gray-500">
                                        ID: {o.user_id}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono font-semibold dark:text-slate-100">
                                    <div className="text-sm">
                                        {o.service_title || "-"}
                                    </div>
                                    <div className="text-xs text-gray-500 hidden ">
                                        Type: {o.service_type ?? "-"}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div
                                        className={`selection:bg-amber-400 flex items-center gap-2 dark:text-slate-100 ${
                                            copiedRow === o.id
                                                ? "text-green-500 font-medium"
                                                : ""
                                        }`}
                                    >
                                        {copiedRow === o.id
                                            ? "Copied!"
                                            : o.target_telegram_id || "-"}{" "}
                                        <button
                                            className="cursor-pointer text-gray-500"
                                            onClick={() =>
                                                handleCopy(
                                                    o.target_telegram_id,
                                                    o.id,
                                                )
                                            }
                                        >
                                            <IoCopyOutline />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-semibold dark:text-slate-100">
                                    {formatAmount(
                                        o.sell_price,
                                        o.sell_currency,
                                    )}
                                </td>
                                <td className="px-4 py-3 font-semibold text-emerald-600">
                                    {Number(o.profit_base ?? 0).toLocaleString(
                                        "fr-FR",
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass[o.status] || "bg-gray-100 text-gray-700"}`}
                                    >
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            disabled={
                                                o.status !== "paid" ||
                                                o.status === "canceled"
                                            }
                                            onClick={() =>
                                                setStatus(o.id, "delivered")
                                            }
                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-black/20 disabled:cursor-not-allowed"
                                        >
                                            Qabul qilish
                                        </button>
                                        <button
                                            disabled={
                                                o.status !== "paid" ||
                                                o.status === "canceled"
                                            }
                                            onClick={() =>
                                                setStatus(o.id, "canceled")
                                            }
                                            className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:bg-black/20 disabled:cursor-not-allowed"
                                        >
                                            Bekor
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-xs dark:text-slate-100">
                                    {formatDate(o.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MOBILE VIEW (Visible below lg) --- */}
            <div className="xl:hidden space-y-3">
                {orders.map((o) => {
                    const isExpanded = o.id === markedRaw;

                    return (
                        <div
                            key={o.id}
                            className={`bg-white dark:bg-slate-900 rounded-xl border transition-all dark:border-slate-800 duration-300  overflow-hidden dark:text-slate-100 ${
                                isExpanded
                                    ? "border-blue-500 shadow-md ring-1 ring-blue-500/10"
                                    : "border-gray-200 shadow-sm"
                            }`}
                        >
                            {/* --- HEADER: Always Visible --- */}
                            <div
                                className={`p-4 flex justify-between items-center cursor-pointer dark:text-slate-100 hover:border-blue-500 ${o.status === "canceled" ? "bg-rose-50 dark:bg-rose-500/30" : o.status === "delivered" ? "bg-emerald-50 dark:bg-emerald-500/30" : "bg-yellow-50 dark:bg-yellow-500/30"} `}
                                onClick={() =>
                                    setMarkedRaw(isExpanded ? null : o.id)
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-900 dark:text-slate-100">
                                        #{o.id}
                                    </span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusClass[o.status] || "bg-gray-100 text-gray-700"}`}
                                    >
                                        {o.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 uppercase font-medium">
                                        {formatDate(o.created_at)}
                                    </span>
                                    <div
                                        className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                    >
                                        <svg
                                            className="w-4 h-4 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* --- EXPANDABLE SECTION --- */}
                            <div
                                className={`transition-all duration-300  ease-in-out ${
                                    isExpanded
                                        ? "max-h-250 opacity-100"
                                        : "max-h-0 opacity-0 pointer-events-none"
                                }`}
                            >
                                <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700 pt-4 dark:bg-slate-900">
                                    {/* Original Content Grid */}
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                        <div className="col-span-2 border-b dark:border-slate-500 pb-2 mb-1">
                                            <p className="text-xs text-gray-400 dark:text-slate-400 uppercase font-medium">
                                                User
                                            </p>
                                            <p className="font-semibold text-gray-800 dark:text-slate-100">
                                                {o.username || "-"}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-slate-500">
                                                ID: {o.user_id}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium dark:text-slate-400">
                                                Mahsulot
                                            </p>
                                            <p className="font-medium text-black dark:text-slate-100">
                                                {o.service_title || "-"}
                                            </p>
                                            <p className="text-xs text-gray-500 italic hidden">
                                                Type: {o.service_type ?? "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium dark:text-slate-400">
                                                Narx
                                            </p>
                                            <p className="font-bold text-emerald-600">
                                                {formatAmount(
                                                    o.sell_price,
                                                    o.sell_currency,
                                                )}
                                            </p>
                                        </div>

                                        <div className="col-span-2 bg-gray-50 dark:bg-slate-700 p-2 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                                            <div className="w-full flex items-center justify-between">
                                                <p className="text-[10px] text-gray-400 dark:text-slate-400 uppercase font-bold">
                                                    Telegram Account
                                                </p>
                                                <button
                                                    className="cursor-pointer text-gray-500 dark:text-slate-200 hover:text-blue-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent toggle
                                                        handleCopy(
                                                            o.target_telegram_id,
                                                            o.id,
                                                        );
                                                    }}
                                                >
                                                    <IoCopyOutline />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                    {copiedRow === o.id
                                                        ? "Copied!"
                                                        : o.target_telegram_id ||
                                                        "-"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-span-2 flex justify-between items-center text-xs text-gray-400 dark:text-white pt-1">
                                            <span
                                                className={
                                                    o.status === "canceled"
                                                        ? "text-rose-500"
                                                        : ""
                                                }
                                            >
                                                Foyda:{" "}
                                                <span className="text-emerald-600 dark:text-emerald-400">
                                                    {Number(
                                                        o.profit_base ?? 0,
                                                    ).toLocaleString(
                                                        "fr-FR",
                                                    )}{" "}
                                                    UZS
                                                </span>
                                            </span>
                                            <span>
                                                {formatDate(o.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Original Actions */}
                                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-700 dark:border-slate-600">
                                        <button
                                            disabled={
                                                o.status !== "paid" ||
                                                o.status === "canceled"
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent toggle
                                                setStatus(o.id, "delivered");
                                            }}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-black/20 disabled:cursor-not-allowed"
                                        >
                                            Qabul qilish
                                        </button>
                                        <button
                                            disabled={
                                                o.status !== "paid" ||
                                                o.status === "canceled"
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent toggle
                                                setStatus(o.id, "canceled");
                                            }}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:bg-black/20 disabled:cursor-not-allowed"
                                        >
                                            Bekor
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {orders.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Buyurtmalar topilmadi</p>
                    </div>
                )}
            </div>
        </div>
    );
}
