import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    FileText,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { useState } from "react";

const TYPE_LABELS = {
    sekali: { label: "SekalıPay", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
    uc:     { label: "UC",        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    ml:     { label: "MLBB",      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
    bundle: { label: "To'plam",   color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
    srv:    { label: "Xizmat",    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
};

function fmt(n) {
    return Number(n ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 });
}

function SummaryCard({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex items-center gap-4">
            <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{fmt(value)} <span className="text-xs font-normal text-slate-400">UZS</span></p>
            </div>
        </div>
    );
}

export default function OrderReceipts() {
    const { filters, summary, byType, daily, receipts } = usePage().props;

    const [from, setFrom]     = useState(filters.from ?? "");
    const [to, setTo]         = useState(filters.to ?? "");
    const [preset, setPreset] = useState(filters.preset ?? "30d");
    const [type, setType]     = useState(filters.type ?? "");

    const applyFilters = (overrides = {}) => {
        router.get("/order-receipts", {
            from:   overrides.from   ?? from,
            to:     overrides.to     ?? to,
            preset: overrides.preset ?? preset,
            type:   overrides.type   !== undefined ? overrides.type : type,
        }, { preserveState: true, replace: true });
    };

    const setPresetAndApply = (p) => {
        setPreset(p); setFrom(""); setTo("");
        applyFilters({ preset: p, from: "", to: "" });
    };

    const profitMargin = summary?.total_sell > 0
        ? ((summary.total_profit / summary.total_sell) * 100).toFixed(1)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6">
            <Head title="Cheklar & Soliq" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/dashboard"
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                    <ArrowLeft className="size-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">Cheklar & Soliq Hisoboti</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Har bir buyurtma uchun daromad, xarajat va foyda</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 mb-5 flex flex-wrap gap-3 items-end">
                {/* Preset */}
                <div className="flex gap-1.5">
                    {[
                        { key: "today", label: "Bugun" },
                        { key: "7d",    label: "7 kun" },
                        { key: "30d",   label: "30 kun" },
                        { key: "90d",   label: "90 kun" },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => setPresetAndApply(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                preset === key && !from
                                    ? "bg-violet-500 text-white"
                                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                            }`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Date range */}
                <div className="flex items-center gap-2">
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 text-xs text-slate-700 dark:text-slate-200 outline-none" />
                    <span className="text-slate-400 text-xs">—</span>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 text-xs text-slate-700 dark:text-slate-200 outline-none" />
                    <button onClick={() => applyFilters()}
                        className="h-8 px-3 rounded-lg bg-violet-500 text-white text-xs font-semibold hover:bg-violet-600 transition-colors">
                        Qo'llash
                    </button>
                </div>

                {/* Type filter */}
                <select value={type} onChange={e => { setType(e.target.value); applyFilters({ type: e.target.value }); }}
                    className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 text-xs text-slate-700 dark:text-slate-200 outline-none">
                    <option value="">Barcha turlar</option>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <SummaryCard
                    icon={Wallet}
                    label="Jami daromad"
                    value={summary?.total_sell}
                    color="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
                <SummaryCard
                    icon={TrendingDown}
                    label="Jami xarajat"
                    value={summary?.total_cost}
                    color="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                />
                <SummaryCard
                    icon={TrendingUp}
                    label="Sof foyda"
                    value={summary?.total_profit}
                    color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                />
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex items-center gap-4">
                    <div className="size-12 rounded-xl flex items-center justify-center shrink-0 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                        <FileText className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Cheklar soni / Margin</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">
                            {summary?.total_count ?? 0} <span className="text-xs font-normal text-emerald-500">({profitMargin}%)</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* By type breakdown */}
            {byType?.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 mb-5">
                    <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Tur bo'yicha taqsimlash</h2>
                    <div className="flex flex-wrap gap-3">
                        {byType.map((row) => {
                            const meta = TYPE_LABELS[row.order_type] ?? { label: row.order_type, color: "bg-slate-100 text-slate-600" };
                            const margin = row.sell > 0 ? ((row.profit / row.sell) * 100).toFixed(1) : 0;
                            return (
                                <div key={row.order_type} className="flex-1 min-w-[160px] rounded-xl border border-slate-100 dark:border-slate-700 p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                                        <span className="text-xs text-slate-400">{row.count} ta</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Daromad: <span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(row.sell)}</span></p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Xarajat: <span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(row.cost)}</span></p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                                        Foyda: {fmt(row.profit)} ({margin}%)
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Soliq eslatmasi */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-4 mb-5">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">📋 Soliq hisobi uchun</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                    Soliq bazasi = <strong>Sof foyda</strong> ({fmt(summary?.total_profit)} UZS).
                    Daromad ({fmt(summary?.total_sell)} UZS) dan xarajat ({fmt(summary?.total_cost)} UZS) ayiriladi.
                    Soliq faqat foydadan hisoblanadi, umumiy aylanmadan emas.
                </p>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                                <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-semibold">Sana</th>
                                <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-semibold">Tur</th>
                                <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-semibold">Ref №</th>
                                <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-semibold">Foydalanuvchi</th>
                                <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-semibold">Mahsulot</th>
                                <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-semibold">Daromad</th>
                                <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-semibold">Xarajat</th>
                                <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-semibold">Foyda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts.data?.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                        Tanlangan davrda cheklar topilmadi
                                    </td>
                                </tr>
                            )}
                            {receipts.data?.map((r) => {
                                const meta = TYPE_LABELS[r.order_type] ?? { label: r.order_type, color: "bg-slate-100 text-slate-600" };
                                const profit = Number(r.profit_uzs ?? 0);
                                return (
                                    <tr key={r.id}
                                        className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(r.created_at).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" })}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.color}`}>
                                                {meta.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {r.order_ref?.length > 12 ? r.order_ref.slice(0, 12) + "…" : r.order_ref}
                                        </td>
                                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                                            @{r.username}
                                        </td>
                                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                                            {r.product_name}
                                        </td>
                                        <td className="px-4 py-2.5 text-right font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                            {fmt(r.sell_price_uzs)}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {fmt(r.cost_price_uzs)}
                                        </td>
                                        <td className={`px-4 py-2.5 text-right font-bold whitespace-nowrap ${profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                                            {profit >= 0 ? "+" : ""}{fmt(profit)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {receipts.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {receipts.from}–{receipts.to} / {receipts.total} ta chek
                        </span>
                        <div className="flex gap-1">
                            {receipts.prev_page_url && (
                                <Link href={receipts.prev_page_url}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <ArrowLeft className="size-4" />
                                </Link>
                            )}
                            <span className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {receipts.current_page} / {receipts.last_page}
                            </span>
                            {receipts.next_page_url && (
                                <Link href={receipts.next_page_url}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <ArrowRight className="size-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
