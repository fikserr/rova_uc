import { Head, usePage } from "@inertiajs/react";

function money(v) {
    return `${Number(v || 0).toLocaleString("fr-FR")} UZS`;
}

function SparkBars({ data = [], field, color = "#2563eb", height = 120 }) {
    const max = Math.max(...data.map((d) => Number(d[field] || 0)), 1);

    return (
        <div className="h-32 flex items-end gap-1">
            {data.map((item) => {
                const value = Number(item[field] || 0);
                const h = Math.max((value / max) * height, 2);
                return (
                    <div
                        key={`${field}-${item.date}`}
                        className="flex-1 rounded-t"
                        style={{ height: `${h}px`, backgroundColor: color }}
                        title={`${item.date}: ${value.toLocaleString("fr-FR")}`}
                    />
                );
            })}
        </div>
    );
}

export default function Dashboard() {
    const { summary = {}, byType = [], statuses = [], trend = [], recentOrders = [] } = usePage().props;

    const statusMax = Math.max(...statuses.map((s) => Number(s.count || 0)), 1);

    return (
        <div className="space-y-6 p-4 md:p-0">
            <Head title="Admin Dashboard" />

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Barcha asosiy statistika va diagrammalar</p>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Users</p>
                    <p className="text-xl font-bold mt-1">{summary.users_count || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Active Users</p>
                    <p className="text-xl font-bold mt-1 text-green-600">{summary.active_users || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="text-xl font-bold mt-1">{summary.orders_count || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Paid/Delivered</p>
                    <p className="text-xl font-bold mt-1 text-blue-600">{summary.paid_orders || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-xl font-bold mt-1 text-indigo-600">{money(summary.revenue_uzs)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Profit</p>
                    <p className="text-xl font-bold mt-1 text-emerald-600">{money(summary.profit_uzs)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900 mb-3">Kunlik Profit Trend (14 kun)</h2>
                    <SparkBars data={trend} field="profit_uzs" color="#10b981" />
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{trend[0]?.date || "-"}</span>
                        <span>{trend[trend.length - 1]?.date || "-"}</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900 mb-3">Kunlik Orders Trend (14 kun)</h2>
                    <SparkBars data={trend} field="orders" color="#3b82f6" />
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{trend[0]?.date || "-"}</span>
                        <span>{trend[trend.length - 1]?.date || "-"}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900 mb-3">Yo'nalishlar bo'yicha</h2>
                    <div className="space-y-3">
                        {byType.map((row) => (
                            <div key={row.key} className="border border-gray-100 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-gray-900">{row.label}</p>
                                    <p className="text-xs text-gray-500">Orders: {row.orders_count}</p>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                    <p>Revenue: <span className="font-semibold">{money(row.revenue_uzs)}</span></p>
                                    <p>Profit: <span className="font-semibold text-emerald-600">{money(row.profit_uzs)}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="font-semibold text-gray-900 mb-3">Order Status Taqsimoti</h2>
                    <div className="space-y-2">
                        {statuses.map((s) => {
                            const percent = ((Number(s.count || 0) / statusMax) * 100).toFixed(1);
                            return (
                                <div key={s.status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize">{s.status}</span>
                                        <span>{s.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded">
                                        <div className="h-2 bg-blue-500 rounded" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">So'nggi buyurtmalar</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="text-left px-4 py-3">Type</th>
                                <th className="text-left px-4 py-3">Order</th>
                                <th className="text-left px-4 py-3">User</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-left px-4 py-3">Sell</th>
                                <th className="text-left px-4 py-3">Profit</th>
                                <th className="text-left px-4 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((o) => (
                                <tr key={`${o.type}-${o.id}`} className="border-t border-gray-100">
                                    <td className="px-4 py-3">{o.type}</td>
                                    <td className="px-4 py-3">#{o.id}</td>
                                    <td className="px-4 py-3">{o.user_id}</td>
                                    <td className="px-4 py-3 capitalize">{o.status}</td>
                                    <td className="px-4 py-3">{money(o.sell_price)}</td>
                                    <td className="px-4 py-3 text-emerald-600 font-medium">{money(o.profit_base)}</td>
                                    <td className="px-4 py-3">{new Date(o.created_at).toLocaleString("ru-RU")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
