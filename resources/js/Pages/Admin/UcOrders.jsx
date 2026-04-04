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

export default function UcOrders() {
    const { orders = [] } = usePage().props;
    const [copiedRow, setCopiedRow] = useState(null);

    const handleCopy = async (playerId, rowId) => {
        if (!playerId) return;
        await navigator.clipboard.writeText(playerId);
        setCopiedRow(rowId);
        setTimeout(() => setCopiedRow(null), 1300); // 1.5 seconds
    };

    const setStatus = (orderId, status) => {
        router.post(
            "/orders/status",
            {
                order_type: "uc",
                order_id: orderId,
                status,
            },
            { preserveScroll: true },
        );
    };

    return (
        <div className="space-y-6 p-4 md:p-0">
            <Head title="UC Orders" />
            <div>
                <h1 className="text-2xl font-bold text-gray-900">UC Orders</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Jami: {orders.length} ta
                </p>
            </div>

            {/* --- DESKTOP VIEW (Visible on lg and up) --- */}
            <div className="hidden lg:block overflow-x-auto bg-white rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="text-left px-4 py-3">ID</th>
                            <th className="text-left px-4 py-3">User</th>
                            <th className="text-left px-4 py-3">Mahsulot</th>
                            <th className="text-left px-4 py-3">
                                PUBG Account
                            </th>
                            <th className="text-left px-4 py-3">Narx</th>
                            <th className="text-left px-4 py-3">
                                Profit (UZS)
                            </th>
                            <th className="text-left px-4 py-3">Status</th>
                            <th className="text-left px-4 py-3">Amallar</th>
                            <th className="text-left px-4 py-3">Sana</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o, index) => (
                            <tr key={o.id} className="border-t">
                                <td className="px-4 py-3 font-semibold">
                                    #{o.id}
                                </td>
                                <td className="px-4 py-3">
                                    <div>{o.username || "-"}</div>
                                    <div className="text-xs text-gray-500">
                                        ID: {o.user_id}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div>{o.product_title || "-"}</div>
                                    <div className="text-xs text-gray-500">
                                        UC: {o.uc_amount ?? "-"}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div
                                        className={`select-none flex items-center gap-2 ${
                                            copiedRow === o.id
                                                ? "text-green-500 font-medium"
                                                : ""
                                        }`}
                                    >
                                        {copiedRow === o.id
                                            ? "Copied!"
                                            : o.pubg_player_id || "-"}{" "}
                                        <button
                                            className="cursor-pointer text-gray-500"
                                            onClick={() =>
                                                handleCopy(
                                                    o.pubg_player_id,
                                                    o.id,
                                                )
                                            }
                                        >
                                            <IoCopyOutline />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {o.pubg_name || "-"}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {formatAmount(
                                        o.sell_price,
                                        o.sell_currency,
                                    )}
                                </td>
                                <td className="px-4 py-3">
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
                                <td className="px-4 py-3">
                                    {formatDate(o.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MOBILE VIEW (Visible below lg) --- */}
            <div className="lg:hidden space-y-4">
                {orders.map((o) => (
                    <div
                        key={o.id}
                        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                    >
                        {/* Header: ID and Status */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-gray-900">
                                #{o.id}
                            </span>
                            <span
                                className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusClass[o.status] || "bg-gray-100 text-gray-700"}`}
                            >
                                {o.status}
                            </span>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                            <div className="col-span-2 border-b pb-2 mb-1">
                                <p className="text-xs text-gray-400 uppercase font-medium">
                                    User
                                </p>
                                <p className="font-semibold text-gray-800">
                                    {o.username || "-"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    ID: {o.user_id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase font-medium">
                                    Mahsulot
                                </p>
                                <p className="font-medium">
                                    {o.product_title || "-"}
                                </p>
                                <p className="text-xs text-gray-500 italic">
                                    UC: {o.uc_amount ?? "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase font-medium">
                                    Narx
                                </p>
                                <p className="font-bold text-emerald-600">
                                    {formatAmount(
                                        o.sell_price,
                                        o.sell_currency,
                                    )}
                                </p>
                            </div>

                            <div className="col-span-2 bg-gray-50 p-2 rounded-lg border border-dashed border-gray-200">
                                <div className="w-full flex items-center justify-between">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                                        PUBG Account
                                    </p>
                                    <button
                                        className="cursor-pointer text-gray-500"
                                        onClick={() =>
                                            handleCopy(o.pubg_player_id, o.id)
                                        }
                                    >
                                        <IoCopyOutline />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-mono font-bold text-indigo-600">
                                        {copiedRow === o.id
                                            ? "Copied!"
                                            : o.pubg_player_id || "-"}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {o.pubg_name || "____________"}
                                    </span>
                                </div>
                            </div>

                            <div className="col-span-2 flex justify-between items-center text-xs text-gray-400 pt-1">
                                <span className={` ${o.status === "canceled" ? "line-through" : ""}`}>
                                    Foyda:{" "}
                                    {Number(o.profit_base ?? 0).toLocaleString(
                                        "fr-FR",
                                    )}{" "}
                                    UZS
                                </span>
                                <span>{formatDate(o.created_at)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button
                                disabled={
                                    o.status !== "paid" ||
                                    o.status === "canceled"
                                }
                                onClick={() => setStatus(o.id, "delivered")}
                                className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-black/20 disabled:cursor-not-allowed"
                            >
                                Qabul qilish
                            </button>
                            <button
                                disabled={
                                    o.status !== "paid" ||
                                    o.status === "canceled"
                                }
                                onClick={() => setStatus(o.id, "canceled")}
                                className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:bg-black/20 disabled:cursor-not-allowed"
                            >
                                Bekor
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State for Mobile */}
                {orders.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Buyurtmalar topilmadi</p>
                    </div>
                )}
            </div>
        </div>
    );
}
