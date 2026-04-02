import { Head, router, usePage } from "@inertiajs/react";

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

    return (
        <div className="space-y-6">
            <Head title="Service Orders" />
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Service Orders</h1>
                <p className="text-sm text-gray-500 mt-1">Jami: {orders.length} ta</p>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="text-left px-4 py-3">ID</th>
                            <th className="text-left px-4 py-3">User</th>
                            <th className="text-left px-4 py-3">Service</th>
                            <th className="text-left px-4 py-3">Target Username</th>
                            <th className="text-left px-4 py-3">Narx</th>
                            <th className="text-left px-4 py-3">Profit (UZS)</th>
                            <th className="text-left px-4 py-3">Status</th>
                            <th className="text-left px-4 py-3">Amallar</th>
                            <th className="text-left px-4 py-3">Sana</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o.id} className="border-t">
                                <td className="px-4 py-3 font-semibold">#{o.id}</td>
                                <td className="px-4 py-3">
                                    <div>{o.username || "-"}</div>
                                    <div className="text-xs text-gray-500">ID: {o.user_id}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div>{o.service_title || "-"}</div>
                                    <div className="text-xs text-gray-500">Type: {o.service_type || "-"}</div>
                                    <div className="text-xs text-gray-500">Value: {o.value ?? "-"}</div>
                                </td>
                                <td className="px-4 py-3">{o.target_telegram_id ?? "-"}</td>
                                <td className="px-4 py-3">{formatAmount(o.sell_price, o.sell_currency)}</td>
                                <td className="px-4 py-3">{Number(o.profit_base ?? 0).toLocaleString("fr-FR")}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass[o.status] || "bg-gray-100 text-gray-700"}`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStatus(o.id, "delivered")}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                        >
                                            Qabul qilish
                                        </button>
                                        <button
                                            onClick={() => setStatus(o.id, "canceled")}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                                        >
                                            Bekor
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3">{formatDate(o.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
