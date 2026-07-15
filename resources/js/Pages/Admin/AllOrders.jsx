import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { IoCopyOutline } from "react-icons/io5";
import { CheckCircle, Loader2 } from "lucide-react";

/* ── helpers ─────────────────────────────────────────────── */
const statusClass = {
    paid:       "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    delivered:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    completed:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    pending:    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    canceled:   "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    failed:     "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

const rowBg = (status) =>
    status === "canceled" || status === "failed"
        ? "bg-rose-50 dark:bg-rose-950/30"
        : status === "delivered" || status === "completed"
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : status === "processing"
            ? "bg-blue-50 dark:bg-blue-950/30"
            : "bg-amber-50 dark:bg-amber-950/20";

const fmtUzs  = (v)   => `${Number(v ?? 0).toLocaleString("fr-FR")} UZS`;
const fmtDate = (v)   => v ? new Date(v).toLocaleString("ru-RU") : "-";

function StatusBadge({ status }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusClass[status] ?? "bg-slate-100 text-slate-600"}`}>
            {status}
        </span>
    );
}

function CopyBtn({ text, id, copiedId, setCopied }) {
    const copy = async (e) => {
        e.stopPropagation();
        if (!text) return;
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 1300);
    };
    return (
        <button className="ml-1 text-slate-400 hover:text-blue-500" onClick={copy}>
            <IoCopyOutline />
        </button>
    );
}

function MobileCard({ o, expanded, onToggle, children }) {
    return (
        <div className={`rounded-xl border overflow-hidden transition-all dark:border-slate-700 ${expanded ? "border-violet-500 shadow-md" : "border-slate-200 dark:border-slate-800 shadow-sm"}`}>
            <div
                className={`p-3 flex justify-between items-center cursor-pointer ${rowBg(o.status)}`}
                onClick={onToggle}
            >
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm dark:text-white">#{o.id}</span>
                    <StatusBadge status={o.status} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{fmtDate(o.created_at)}</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {expanded && (
                <div className="px-4 pb-4 pt-3 border-t dark:border-slate-700 bg-white dark:bg-slate-900">
                    {children}
                </div>
            )}
        </div>
    );
}

const STATUSES_SEKALI = ['all', 'pending', 'paid', 'processing', 'completed', 'delivered', 'canceled', 'failed'];

function FilterBar({ filter, setFilter }) {
    return (
        <div className="flex gap-2 flex-wrap mb-3">
            {STATUSES_SEKALI.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${filter === s ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    {s === 'all' ? 'Barchasi' : s}
                </button>
            ))}
        </div>
    );
}

export default function AllOrders() {
    const { sekaliOrders: sk0 = [] } = usePage().props;
    const [orders, setOrders]     = useState(sk0);
    const [expanded, setExpanded] = useState(null);
    const [copiedId, setCopied]   = useState(null);
    const [filter, setFilter]     = useState('all');
    const [completing, setCompleting] = useState(null); // order id being completed
    const intervalRef             = useRef(null);

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const refresh = async () => {
        try {
            const res = await axios.get("/all-orders/data");
            setOrders(res.data.sekaliOrders ?? []);
        } catch (_) {}
    };

    const handleComplete = async (e, orderId) => {
        e.stopPropagation();
        if (completing) return;
        setCompleting(orderId);
        try {
            await axios.post("/orders/sekali/complete", { order_id: orderId });
            await refresh();
        } catch (err) {
            alert(err?.response?.data?.message ?? "Xatolik yuz berdi");
        } finally {
            setCompleting(null);
        }
    };

    useEffect(() => {
        intervalRef.current = setInterval(refresh, 4000);
        window.addEventListener("focus", refresh);
        return () => {
            clearInterval(intervalRef.current);
            window.removeEventListener("focus", refresh);
        };
    }, []);

    return (
        <div className="space-y-5 p-0">
            <Head title="SekalıPay Buyurtmalari" />

            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SekalıPay Buyurtmalari</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Jami: {orders.length} ta</p>
                </div>
                <a href="/orders/export?type=sekali"
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 text-white hover:bg-slate-600 flex items-center gap-1 shrink-0 mt-1">
                    &#8595; Export CSV
                </a>
            </div>

            <FilterBar filter={filter} setFilter={setFilter} />

            {/* Desktop */}
            <div className="hidden xl:block overflow-x-auto rounded-xl border dark:border-slate-700">
                <table className="min-w-full text-sm bg-white dark:bg-slate-900">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                        <tr>
                            {["#", "User", "O'yin / Mahsulot", "Akkaunt", "Status", "Narx", "Invoice", "Amal", "Sana"].map(h => (
                                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map(o => (
                            <tr key={o.id} className={`${rowBg(o.status)} transition-colors`}>
                                <td className="px-4 py-3 font-mono font-semibold text-xs dark:text-slate-200">#{o.id}</td>
                                <td className="px-4 py-3 text-xs dark:text-slate-200">
                                    <div className="font-medium">{o.username || "-"}</div>
                                    <div className="text-slate-400 text-[11px]">ID: {o.user_id}</div>
                                </td>
                                <td className="px-4 py-3 dark:text-slate-200">
                                    <div className="font-semibold text-sm">{o.game_name}</div>
                                    <div className="text-xs text-slate-500">{o.product_name}</div>
                                    {o.product_type && <div className="text-[11px] text-violet-500">{o.product_type}</div>}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs dark:text-slate-200">
                                    <div className="flex items-center gap-1">
                                        <span className={copiedId === `g-${o.id}` ? "text-green-500" : ""}>
                                            {copiedId === `g-${o.id}` ? "Copied!" : o.game_target || "-"}
                                        </span>
                                        <CopyBtn text={o.game_target} id={`g-${o.id}`} copiedId={copiedId} setCopied={setCopied} />
                                    </div>
                                    {o.zone_id && <div className="text-slate-400 text-[11px]">Zone: {o.zone_id}</div>}
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                                <td className="px-4 py-3 font-semibold text-sm dark:text-slate-200">{fmtUzs(o.price_uzs)}</td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{o.sekali_invoice || "-"}</td>
                                <td className="px-4 py-3">
                                    {['pending', 'processing'].includes(o.status) && (
                                        <button
                                            onClick={(e) => handleComplete(e, o.id)}
                                            disabled={completing === o.id}
                                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 whitespace-nowrap"
                                        >
                                            {completing === o.id
                                                ? <Loader2 className="size-3 animate-spin" />
                                                : <CheckCircle className="size-3" />}
                                            Bajarildi
                                        </button>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-xs dark:text-slate-300">{fmtDate(o.created_at)}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Buyurtmalar yo'q</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="xl:hidden space-y-2">
                {filtered.map(o => (
                    <MobileCard key={o.id} o={o} expanded={expanded === o.id} onToggle={() => setExpanded(p => p === o.id ? null : o.id)}>
                        <div className="text-xs space-y-2 dark:text-slate-200">
                            <div className="flex justify-between">
                                <span className="text-slate-400">User</span>
                                <span className="font-medium">{o.username || "-"} <span className="text-slate-400">(ID:{o.user_id})</span></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">O'yin</span>
                                <span className="font-semibold text-violet-600 dark:text-violet-400">{o.game_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Mahsulot</span>
                                <span className="text-right max-w-[60%]">{o.product_name}</span>
                            </div>
                            {o.product_type && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Server</span>
                                    <span>{o.product_type}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Game ID</span>
                                <span className="font-mono flex items-center gap-1">
                                    {copiedId === `g-${o.id}` ? <span className="text-green-500">Copied!</span> : o.game_target || "-"}
                                    <CopyBtn text={o.game_target} id={`g-${o.id}`} copiedId={copiedId} setCopied={setCopied} />
                                </span>
                            </div>
                            {o.zone_id && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Zone</span>
                                    <span className="font-mono">{o.zone_id}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-400">Narx</span>
                                <span className="font-bold text-emerald-600">{fmtUzs(o.price_uzs)}</span>
                            </div>
                            {o.sekali_invoice && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Invoice</span>
                                    <span className="font-mono text-[11px]">{o.sekali_invoice}</span>
                                </div>
                            )}
                            {o.notes && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Izoh</span>
                                    <span className="text-rose-500">{o.notes}</span>
                                </div>
                            )}
                            {['pending', 'processing'].includes(o.status) && (
                                <button
                                    onClick={(e) => handleComplete(e, o.id)}
                                    disabled={completing === o.id}
                                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {completing === o.id
                                        ? <Loader2 className="size-3 animate-spin" />
                                        : <CheckCircle className="size-3" />}
                                    Bajarildi (qo'lda)
                                </button>
                            )}
                        </div>
                    </MobileCard>
                ))}
                {filtered.length === 0 && <p className="text-center text-slate-400 py-8">Buyurtmalar yo'q</p>}
            </div>
        </div>
    );
}
