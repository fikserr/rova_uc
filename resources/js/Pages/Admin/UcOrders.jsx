import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { IoCopyOutline } from "react-icons/io5";

/* ── helpers ─────────────────────────────────────────────── */
const statusClass = {
    paid:      "bg-emerald-100 text-emerald-700",
    delivered: "bg-emerald-100 text-emerald-700",
    pending:   "bg-amber-100 text-amber-700",
    canceled:  "bg-rose-100 text-rose-700",
};

const rowBg = (status) =>
    status === "canceled"
        ? "bg-rose-50 dark:bg-rose-950/30"
        : status === "delivered"
          ? "bg-emerald-50 dark:bg-emerald-950/35"
          : "bg-yellow-50 dark:bg-yellow-950/30";

const fmt     = (v, c) => `${Number(v ?? 0).toLocaleString("fr-FR")} ${c ?? ""}`;
const fmtDate = (v)    => v ? new Date(v).toLocaleString("ru-RU") : "-";

const TABS = [
    { id: "uc",      label: "UC (PUBG)",           color: "blue"   },
    { id: "service", label: "Telegram xizmatlari", color: "amber"  },
    { id: "bundle",  label: "To'plamlar",           color: "violet" },
];
const tabActive = {
    blue:   "border-blue-600 text-blue-600 dark:text-blue-400",
    amber:  "border-amber-500 text-amber-600 dark:text-amber-400",
    violet: "border-violet-600 text-violet-600 dark:text-violet-400",
};
const tabCount = {
    blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    amber:  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

function StatusBadge({ status }) {
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass[status] || "bg-gray-100 text-gray-700"}`}>
            {status}
        </span>
    );
}

function CopyBtn({ text, id, copiedId, onCopy }) {
    return (
        <button
            className="cursor-pointer text-gray-500 dark:text-slate-400 hover:text-blue-500"
            onClick={(e) => { e.stopPropagation(); onCopy(text, id); }}
        >
            <IoCopyOutline />
        </button>
    );
}

/* ── Filter Bar ──────────────────────────────────────────── */
const STATUSES = ['all', 'pending', 'paid', 'delivered', 'canceled'];

function FilterBar({ filter, setFilter, color = 'blue' }) {
    const activeClass = color === 'blue'
        ? 'bg-blue-600 text-white'
        : 'bg-amber-500 text-white';
    return (
        <div className="flex gap-2 flex-wrap mb-3">
            {STATUSES.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${filter === s ? activeClass : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    {s === 'all' ? 'Barchasi' : s}
                </button>
            ))}
        </div>
    );
}

/* ── UC tab ──────────────────────────────────────────────── */
function UcTab({ orders }) {
    const [expanded, setExpanded] = useState(null);
    const [copiedId, setCopied]   = useState(null);
    const [filter, setFilter]     = useState('all');

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const copy = async (text, id) => {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 1300);
    };

    const setStatus = (orderId, status, description = "") =>
        router.post("/orders/status", { order_type: "uc", order_id: orderId, status, description }, { preserveScroll: true });

    const canAct = (o) => o.status === "paid";

    return (
        <>
            <FilterBar filter={filter} setFilter={setFilter} color="blue" />
            {/* Desktop */}
            <div className="hidden xl:block overflow-x-auto bg-white rounded-xl border border-gray-200 dark:bg-slate-900 dark:border-gray-700">
                <table className="min-w-full text-sm dark:bg-slate-900">
                    <thead className="bg-gray-50 text-gray-600 dark:bg-slate-900 dark:text-gray-50">
                        <tr className="font-mono">
                            {["ID", "User", "Mahsulot", "PUBG Account", "Narx", "Foyda (UZS)", "Status", "Amallar", "Sana"].map(h => (
                                <th key={h} className="text-left px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(o => (
                            <tr key={o.id}
                                onClick={() => setExpanded(p => p === o.id ? null : o.id)}
                                className={`cursor-pointer transition-all border-t-2 ${o.id === expanded ? "border-blue-700 shadow-md" : "border-transparent"} ${rowBg(o.status)}`}
                            >
                                <td className="px-4 py-3 font-semibold font-mono dark:text-slate-100">#{o.id}</td>
                                <td className="px-4 py-3 text-xs dark:text-slate-100">
                                    <div>{o.username || "-"}</div>
                                    <div className="text-xs text-gray-500">ID: {o.user_id}</div>
                                </td>
                                <td className="px-4 py-3 font-mono font-semibold dark:text-slate-100">{o.product_title || "-"}</td>
                                <td className="px-4 py-3">
                                    <div className={`flex items-center gap-2 dark:text-slate-100 ${copiedId === o.id ? "text-green-500 font-medium" : ""}`}>
                                        {copiedId === o.id ? "Copied!" : o.pubg_player_id || "-"}
                                        <CopyBtn text={o.pubg_player_id} id={o.id} copiedId={copiedId} onCopy={copy} />
                                    </div>
                                    <div className="text-xs text-gray-700 dark:text-slate-400">{o.pubg_name || "-"}</div>
                                </td>
                                <td className="px-4 py-3 font-semibold dark:text-slate-100">{fmt(o.sell_price, o.sell_currency)}</td>
                                <td className="px-4 py-3 font-semibold text-emerald-600">{Number(o.profit_base ?? 0).toLocaleString("fr-FR")}</td>
                                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button disabled={!canAct(o)} onClick={(e) => { e.stopPropagation(); setStatus(o.id, "delivered"); }}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Qabul qilish
                                        </button>
                                        <button disabled={!canAct(o)} onClick={(e) => {
                                            e.stopPropagation();
                                            const r = prompt("Bekor qilish sababi:");
                                            if (!r?.trim()) return;
                                            setStatus(o.id, "canceled", r.trim());
                                        }} className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Bekor
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-xs dark:text-slate-100">{fmtDate(o.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="xl:hidden space-y-3">
                {filtered.map(o => {
                    const isExpanded = expanded === o.id;
                    return (
                        <div key={o.id} className={`bg-white dark:bg-slate-900 rounded-xl border transition-all dark:border-slate-800 overflow-hidden dark:text-slate-100 ${isExpanded ? "border-blue-500 shadow-md" : "border-gray-200 shadow-sm"}`}>
                            <div className={`p-4 flex justify-between items-center cursor-pointer ${rowBg(o.status)}`}
                                onClick={() => setExpanded(p => p === o.id ? null : o.id)}>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold">#{o.id}</span>
                                    <StatusBadge status={o.status} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">{fmtDate(o.created_at)}</span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="px-4 pb-4 border-t dark:border-slate-700 pt-4 dark:bg-slate-900">
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                        <div className="col-span-2 border-b dark:border-slate-500 pb-2 mb-1">
                                            <p className="text-xs text-gray-400 uppercase font-medium">User</p>
                                            <p className="font-semibold">{o.username || "-"}</p>
                                            <p className="text-xs text-gray-500">ID: {o.user_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">Mahsulot</p>
                                            <p className="font-medium">{o.product_title || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">Narx</p>
                                            <p className="font-bold text-emerald-600">{fmt(o.sell_price, o.sell_currency)}</p>
                                        </div>
                                        <div className="col-span-2 bg-gray-50 dark:bg-slate-700 p-2 rounded-lg border border-dashed dark:border-slate-600">
                                            <div className="flex justify-between">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">PUBG Account</p>
                                                <CopyBtn text={o.pubg_player_id} id={o.id} copiedId={copiedId} onCopy={copy} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                    {copiedId === o.id ? "Copied!" : o.pubg_player_id || "-"}
                                                </span>
                                                <span className="text-xs text-gray-600 dark:text-slate-100">{o.pubg_name || "—"}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex justify-between text-xs text-gray-400 pt-1">
                                            <span>Foyda: <span className="text-emerald-600 dark:text-emerald-400">{Number(o.profit_base ?? 0).toLocaleString("fr-FR")} UZS</span></span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t dark:border-slate-600">
                                        <button disabled={!canAct(o)} onClick={() => setStatus(o.id, "delivered")}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Qabul qilish
                                        </button>
                                        <button disabled={!canAct(o)} onClick={() => {
                                            const r = prompt("Bekor qilish sababi:");
                                            if (!r?.trim()) return;
                                            setStatus(o.id, "canceled", r.trim());
                                        }} className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Bekor
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600">
                        <p className="text-gray-500">Buyurtmalar topilmadi</p>
                    </div>
                )}
            </div>
        </>
    );
}

/* ── Service tab ─────────────────────────────────────────── */
function ServiceTab({ orders }) {
    const [expanded, setExpanded] = useState(null);
    const [copiedId, setCopied]   = useState(null);
    const [filter, setFilter]     = useState('all');

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const copy = async (text, id) => {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 1300);
    };

    const setStatus = (orderId, status, description = "") =>
        router.post("/orders/status", { order_type: "service", order_id: orderId, status, description }, { preserveScroll: true });

    const canAct = (o) => o.status === "paid";

    const svcLabel = (o) =>
        o.service_type === "premium" ? "Telegram Premium"
        : o.service_type === "stars" ? "Telegram Stars"
        : o.service_title || "-";

    return (
        <>
            <FilterBar filter={filter} setFilter={setFilter} color="amber" />
            {/* Desktop */}
            <div className="hidden xl:block overflow-x-auto bg-white rounded-xl border border-gray-200 dark:bg-slate-900 dark:border-gray-700">
                <table className="min-w-full text-sm dark:bg-slate-900">
                    <thead className="bg-gray-50 text-gray-600 dark:bg-slate-900 dark:text-gray-50">
                        <tr className="font-mono">
                            {["ID", "User", "Xizmat", "Telegram ID", "Narx", "Foyda (UZS)", "Status", "Amallar", "Sana"].map(h => (
                                <th key={h} className="text-left px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(o => (
                            <tr key={o.id}
                                onClick={() => setExpanded(p => p === o.id ? null : o.id)}
                                className={`cursor-pointer transition-all border-t-2 ${o.id === expanded ? "border-amber-500 shadow-md" : "border-transparent"} ${rowBg(o.status)}`}
                            >
                                <td className="px-4 py-3 font-semibold font-mono dark:text-slate-100">#{o.id}</td>
                                <td className="px-4 py-3 text-xs dark:text-slate-100">
                                    <div>{o.username || "-"}</div>
                                    <div className="text-xs text-gray-500">ID: {o.user_id}</div>
                                </td>
                                <td className="px-4 py-3 font-semibold dark:text-slate-100">{svcLabel(o)}</td>
                                <td className="px-4 py-3">
                                    <div className={`flex items-center gap-2 dark:text-slate-100 ${copiedId === o.id ? "text-green-500 font-medium" : ""}`}>
                                        {copiedId === o.id ? "Copied!" : o.target_telegram_id || "-"}
                                        <CopyBtn text={o.target_telegram_id} id={o.id} copiedId={copiedId} onCopy={copy} />
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-semibold dark:text-slate-100">{fmt(o.sell_price, o.sell_currency)}</td>
                                <td className="px-4 py-3 font-semibold text-emerald-600">{Number(o.profit_base ?? 0).toLocaleString("fr-FR")}</td>
                                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button disabled={!canAct(o)} onClick={(e) => { e.stopPropagation(); setStatus(o.id, "delivered"); }}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Qabul qilish
                                        </button>
                                        <button disabled={!canAct(o)} onClick={(e) => {
                                            e.stopPropagation();
                                            const r = prompt("Bekor qilish sababi:");
                                            if (!r?.trim()) return;
                                            setStatus(o.id, "canceled", r.trim());
                                        }} className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Bekor
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-xs dark:text-slate-100">{fmtDate(o.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="xl:hidden space-y-3">
                {filtered.map(o => {
                    const isExpanded = expanded === o.id;
                    return (
                        <div key={o.id} className={`bg-white dark:bg-slate-900 rounded-xl border transition-all dark:border-slate-800 overflow-hidden dark:text-slate-100 ${isExpanded ? "border-amber-500 shadow-md" : "border-gray-200 shadow-sm"}`}>
                            <div className={`p-4 flex justify-between items-center cursor-pointer ${rowBg(o.status)}`}
                                onClick={() => setExpanded(p => p === o.id ? null : o.id)}>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold">#{o.id}</span>
                                    <StatusBadge status={o.status} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">{fmtDate(o.created_at)}</span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="px-4 pb-4 border-t dark:border-slate-700 pt-4 dark:bg-slate-900">
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                        <div className="col-span-2 border-b dark:border-slate-500 pb-2 mb-1">
                                            <p className="text-xs text-gray-400 uppercase font-medium">User</p>
                                            <p className="font-semibold">{o.username || "-"}</p>
                                            <p className="text-xs text-gray-500">ID: {o.user_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">Xizmat</p>
                                            <p className="font-medium">{svcLabel(o)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">Narx</p>
                                            <p className="font-bold text-emerald-600">{fmt(o.sell_price, o.sell_currency)}</p>
                                        </div>
                                        <div className="col-span-2 bg-gray-50 dark:bg-slate-700 p-2 rounded-lg border border-dashed dark:border-slate-600">
                                            <div className="flex justify-between">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Telegram ID</p>
                                                <CopyBtn text={o.target_telegram_id} id={o.id} copiedId={copiedId} onCopy={copy} />
                                            </div>
                                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                {copiedId === o.id ? "Copied!" : o.target_telegram_id || "-"}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-between text-xs text-gray-400 pt-1">
                                            <span>Foyda: <span className="text-emerald-600 dark:text-emerald-400">{Number(o.profit_base ?? 0).toLocaleString("fr-FR")} UZS</span></span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t dark:border-slate-600">
                                        <button disabled={!canAct(o)} onClick={() => setStatus(o.id, "delivered")}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Qabul qilish
                                        </button>
                                        <button disabled={!canAct(o)} onClick={() => {
                                            const r = prompt("Bekor qilish sababi:");
                                            if (!r?.trim()) return;
                                            setStatus(o.id, "canceled", r.trim());
                                        }} className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Bekor
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600">
                        <p className="text-gray-500">Buyurtmalar topilmadi</p>
                    </div>
                )}
            </div>
        </>
    );
}

/* ── Bundle tab ──────────────────────────────────────────── */
function BundleTab({ orders }) {
    const [expanded, setExpanded] = useState(null);
    const [copiedId, setCopied]   = useState(null);
    const [filter, setFilter]     = useState('all');

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const copy = async (text, id) => {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 1300);
    };

    const setStatus = (orderId, status, description = "") =>
        router.post("/orders/status", { order_type: "bundle", order_id: orderId, status, description }, { preserveScroll: true });

    const canAct = (o) => o.status === "paid";

    return (
        <>
            <FilterBar filter={filter} setFilter={setFilter} color="violet" />
            {/* Desktop */}
            <div className="hidden xl:block overflow-x-auto bg-white rounded-xl border border-gray-200 dark:bg-slate-900 dark:border-gray-700">
                <table className="min-w-full text-sm dark:bg-slate-900">
                    <thead className="bg-gray-50 text-gray-600 dark:bg-slate-900 dark:text-gray-50">
                        <tr className="font-mono">
                            {["ID", "User", "To'plam", "PUBG Account", "Narx", "Foyda (UZS)", "Status", "Amallar", "Sana"].map(h => (
                                <th key={h} className="text-left px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(o => (
                            <tr key={o.id}
                                onClick={() => setExpanded(p => p === o.id ? null : o.id)}
                                className={`cursor-pointer transition-all border-t-2 ${o.id === expanded ? "border-violet-600 shadow-md" : "border-transparent"} ${rowBg(o.status)}`}
                            >
                                <td className="px-4 py-3 font-semibold font-mono dark:text-slate-100">#{o.id}</td>
                                <td className="px-4 py-3 text-xs dark:text-slate-100">
                                    <div>{o.username || "-"}</div>
                                    <div className="text-xs text-gray-500">ID: {o.user_id}</div>
                                </td>
                                <td className="px-4 py-3 font-semibold dark:text-slate-100">{o.bundle_title || "-"}</td>
                                <td className="px-4 py-3">
                                    <div className={`flex items-center gap-2 dark:text-slate-100 ${copiedId === o.id ? "text-green-500 font-medium" : ""}`}>
                                        {copiedId === o.id ? "Copied!" : o.pubg_player_id || "-"}
                                        <CopyBtn text={o.pubg_player_id} id={o.id} copiedId={copiedId} onCopy={copy} />
                                    </div>
                                    <div className="text-xs text-gray-700 dark:text-slate-400">{o.pubg_name || "-"}</div>
                                </td>
                                <td className="px-4 py-3 font-semibold dark:text-slate-100">{fmt(o.sell_price, o.sell_currency)}</td>
                                <td className="px-4 py-3 font-semibold text-emerald-600">{Number(o.profit_base ?? 0).toLocaleString("fr-FR")}</td>
                                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button disabled={!canAct(o)} onClick={(e) => { e.stopPropagation(); setStatus(o.id, "delivered"); }}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Qabul qilish
                                        </button>
                                        <button disabled={!canAct(o)} onClick={(e) => {
                                            e.stopPropagation();
                                            const r = prompt("Bekor qilish sababi:");
                                            if (!r?.trim()) return;
                                            setStatus(o.id, "canceled", r.trim());
                                        }} className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Bekor
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-xs dark:text-slate-100">{fmtDate(o.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="xl:hidden space-y-3">
                {filtered.map(o => {
                    const isExpanded = expanded === o.id;
                    return (
                        <div key={o.id} className={`bg-white dark:bg-slate-900 rounded-xl border transition-all dark:border-slate-800 overflow-hidden dark:text-slate-100 ${isExpanded ? "border-violet-500 shadow-md" : "border-gray-200 shadow-sm"}`}>
                            <div className={`p-4 flex justify-between items-center cursor-pointer ${rowBg(o.status)}`}
                                onClick={() => setExpanded(p => p === o.id ? null : o.id)}>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold">#{o.id}</span>
                                    <StatusBadge status={o.status} />
                                    <span className="text-xs text-violet-600 dark:text-violet-400 font-medium truncate max-w-30">{o.bundle_title || "-"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">{fmtDate(o.created_at)}</span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="px-4 pb-4 border-t dark:border-slate-700 pt-4 dark:bg-slate-900">
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                        <div className="col-span-2 border-b dark:border-slate-500 pb-2 mb-1">
                                            <p className="text-xs text-gray-400 uppercase font-medium">User</p>
                                            <p className="font-semibold">{o.username || "-"}</p>
                                            <p className="text-xs text-gray-500">ID: {o.user_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">To'plam</p>
                                            <p className="font-medium">{o.bundle_title || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">Narx</p>
                                            <p className="font-bold text-emerald-600">{fmt(o.sell_price, o.sell_currency)}</p>
                                        </div>
                                        <div className="col-span-2 bg-gray-50 dark:bg-slate-700 p-2 rounded-lg border border-dashed dark:border-slate-600">
                                            <div className="flex justify-between">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">PUBG Account</p>
                                                <CopyBtn text={o.pubg_player_id} id={o.id} copiedId={copiedId} onCopy={copy} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                    {copiedId === o.id ? "Copied!" : o.pubg_player_id || "-"}
                                                </span>
                                                <span className="text-xs text-gray-600 dark:text-slate-100">{o.pubg_name || "—"}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex justify-between text-xs text-gray-400 pt-1">
                                            <span>Foyda: <span className="text-emerald-600 dark:text-emerald-400">{Number(o.profit_base ?? 0).toLocaleString("fr-FR")} UZS</span></span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t dark:border-slate-600">
                                        <button disabled={!canAct(o)} onClick={() => setStatus(o.id, "delivered")}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Qabul qilish
                                        </button>
                                        <button disabled={!canAct(o)} onClick={() => {
                                            const r = prompt("Bekor qilish sababi:");
                                            if (!r?.trim()) return;
                                            setStatus(o.id, "canceled", r.trim());
                                        }} className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:bg-black/20 disabled:cursor-not-allowed">
                                            Bekor
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600">
                        <p className="text-gray-500">Buyurtmalar topilmadi</p>
                    </div>
                )}
            </div>
        </>
    );
}

/* ── Main page ───────────────────────────────────────────── */
export default function UcOrders() {
    const { ucOrders: uc0 = [], serviceOrders: sv0 = [], bundleOrders: bn0 = [] } = usePage().props;
    const [data, setData]   = useState({ ucOrders: uc0, serviceOrders: sv0, bundleOrders: bn0 });
    const [tab, setTab]     = useState("uc");
    const intervalRef       = useRef(null);

    const refresh = async () => {
        try {
            const res = await axios.get("/uc-orders/data");
            setData(res.data);
        } catch (_) {}
    };

    useEffect(() => {
        intervalRef.current = setInterval(refresh, 3000);
        window.addEventListener("focus", refresh);
        return () => {
            clearInterval(intervalRef.current);
            window.removeEventListener("focus", refresh);
        };
    }, []);

    const counts = { uc: data.ucOrders.length, service: data.serviceOrders.length, bundle: (data.bundleOrders ?? []).length };

    return (
        <div className="space-y-5 p-0">
            <Head title="UC & Service Orders" />

            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buyurtmalar</h1>
                    <p className="text-sm text-gray-500 mt-1 dark:text-white/60">
                        UC: {counts.uc} ta · Service: {counts.service} ta · To'plam: {counts.bundle} ta
                    </p>
                </div>
                <a href={`/orders/export?type=${tab}`}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 text-white hover:bg-slate-600 flex items-center gap-1 shrink-0 mt-1">
                    &#8595; Export CSV
                </a>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                            tab === t.id
                                ? tabActive[t.color] + " border-current"
                                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                    >
                        {t.label}
                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${tab === t.id ? tabCount[t.color] : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                            {counts[t.id]}
                        </span>
                    </button>
                ))}
            </div>

            {tab === "uc"      && <UcTab      orders={data.ucOrders} />}
            {tab === "service" && <ServiceTab orders={data.serviceOrders} />}
            {tab === "bundle"  && <BundleTab  orders={data.bundleOrders ?? []} />}
        </div>
    );
}
