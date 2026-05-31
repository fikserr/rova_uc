import { Head, router } from "@inertiajs/react"
import axios from "axios"
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronDown,
    Clock,
    Filter,
    Receipt,
    Search,
    TrendingUp,
    X,
    XCircle,
    ZoomIn
} from "lucide-react"
import { useState } from "react"

const STATUS_LABEL = {
    pending: {
        text: "Kutilmoqda",
        cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
        dot: "bg-amber-400",
        ring: "ring-amber-200 dark:ring-amber-800/50",
        glow: "shadow-amber-100 dark:shadow-amber-900/20",
    },
    approved: {
        text: "Tasdiqlandi",
        cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
        dot: "bg-emerald-400",
        ring: "ring-emerald-200 dark:ring-emerald-800/50",
        glow: "shadow-emerald-100 dark:shadow-emerald-900/20",
    },
    rejected: {
        text: "Rad etildi",
        cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
        dot: "bg-rose-400",
        ring: "ring-rose-200 dark:ring-rose-800/50",
        glow: "shadow-rose-100 dark:shadow-rose-900/20",
    },
};

function resolveReceiptUrl(raw) {
    if (!raw) return null;
    if (/^https?:\/\//.test(raw)) return raw;
    const cleaned = raw.replace(/^\//, "");
    if (cleaned.startsWith("storage/app/public/"))
        return "/" + cleaned.replace("storage/app/public/", "storage/");
    if (cleaned.startsWith("storage/app/"))
        return "/" + cleaned.replace("storage/app/", "storage/");
    return "/" + cleaned;
}

function StatCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-sm`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{value}</p>
                    {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
                </div>
                <div className={`p-2.5 rounded-xl ${color}`}>
                    <Icon className="size-5 text-white" />
                </div>
            </div>
        </div>
    );
}

function TopupCard({ r, onApprove, onReject, loadingId, onLightbox }) {
    const [open, setOpen] = useState(r.status === "pending");
    const s = STATUS_LABEL[r.status] ?? {
        text: r.status,
        cls: "bg-slate-100 text-slate-600 border border-slate-200",
        dot: "bg-slate-400",
        ring: "",
        glow: "",
    };
    const isPending = r.status === "pending";
    const busy = loadingId === r.id;
    const receiptUrl = resolveReceiptUrl(r.receipt_url);

    return (
        <div className={`
            bg-white dark:bg-slate-800/90 rounded-2xl border transition-all duration-200 overflow-hidden
            ${isPending
                ? "border-amber-200 dark:border-amber-700/40 shadow-md shadow-amber-50 dark:shadow-amber-900/10"
                : "border-slate-100 dark:border-slate-700/60 shadow-sm"
            }
            hover:shadow-md hover:-translate-y-px
        `}>
            {/* Pending top accent bar */}
            {isPending && (
                <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
            )}

            {/* Card header */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen((v) => !v)}
                onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
            >
                {/* Avatar with status dot */}
                <div className="relative shrink-0">
                    <div className={`size-9 rounded-xl flex items-center justify-center font-bold text-sm text-white
                        ${r.status === 'pending' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                          r.status === 'approved' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                          'bg-gradient-to-br from-rose-400 to-pink-500'}`}>
                        {(r.username || "?")[0].toUpperCase()}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-slate-800 ${s.dot}`} />
                </div>

                {/* User + date */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate leading-tight">
                        {r.username}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="size-3 shrink-0" />
                        {new Date(r.created_at).toLocaleString("ru-RU")}
                    </p>
                </div>

                {/* Desktop extras */}
                <div className="hidden lg:flex items-center gap-6 mr-4">
                    <div className="text-center">
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">ID</p>
                        <p className="text-sm font-mono font-semibold text-slate-500 dark:text-slate-400">#{r.id}</p>
                    </div>
                    {receiptUrl ? (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onLightbox(receiptUrl); }}
                            className="group relative block w-14 h-12 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                        >
                            <img src={receiptUrl} alt="Chek" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <ZoomIn className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                    ) : (
                        <div className="w-14 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <Receipt className="size-4 text-slate-300 dark:text-slate-600" />
                        </div>
                    )}
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                    <span className="font-bold text-slate-800 dark:text-white text-sm sm:text-base whitespace-nowrap">
                        {Number(r.amount).toLocaleString("fr-FR")}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block">UZS</span>
                </div>

                {/* Status badge — hidden on xs */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap hidden sm:inline-flex items-center gap-1.5 ${s.cls}`}>
                    <span className={`size-1.5 rounded-full ${s.dot}`} />
                    {s.text}
                </span>

                {/* Desktop action buttons */}
                {isPending && (
                    <div className="hidden lg:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => onApprove(r.id)}
                            disabled={busy}
                            className="flex items-center gap-1.5 px-3.5 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold disabled:opacity-50 transition-all shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"
                        >
                            <CheckCircle className="size-3.5" />
                            Tasdiqlash
                        </button>
                        <button
                            type="button"
                            onClick={() => onReject(r.id)}
                            disabled={busy}
                            className="flex items-center gap-1.5 px-3.5 h-8 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold disabled:opacity-50 transition-all shadow-sm shadow-rose-200 dark:shadow-rose-900/30"
                        >
                            <XCircle className="size-3.5" />
                            Rad etish
                        </button>
                    </div>
                )}

                <ChevronDown className={`lg:hidden size-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </div>

            {/* Expandable body — mobile */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="mx-4 mb-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 p-4 space-y-4">
                    {/* Mobile status */}
                    <div className="sm:hidden">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${s.cls}`}>
                            <span className={`size-1.5 rounded-full ${s.dot}`} />
                            {s.text}
                        </span>
                    </div>

                    <div className="flex gap-4">
                        {/* Receipt */}
                        <div className="shrink-0">
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Chek</p>
                            {receiptUrl ? (
                                <button
                                    type="button"
                                    onClick={() => onLightbox(receiptUrl)}
                                    className="group relative block w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 transition-all"
                                >
                                    <img src={receiptUrl} alt="Chek" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <ZoomIn className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ) : (
                                <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <Receipt className="size-6 text-slate-400 dark:text-slate-500" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-3">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">So'rov ID</p>
                                <p className="text-sm font-mono font-semibold text-slate-600 dark:text-slate-300">#{r.id}</p>
                            </div>
                            {r.notes && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Izoh</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{r.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {isPending && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => onApprove(r.id)}
                                disabled={busy}
                                className="flex items-center justify-center gap-2 flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-bold disabled:opacity-50 transition-all shadow-sm"
                            >
                                <CheckCircle className="size-4" />
                                Tasdiqlash
                            </button>
                            <button
                                type="button"
                                onClick={() => onReject(r.id)}
                                disabled={busy}
                                className="flex items-center justify-center gap-2 flex-1 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-sm font-bold disabled:opacity-50 transition-all shadow-sm"
                            >
                                <XCircle className="size-4" />
                                Rad etish
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ManualTopups({ requests = [], pending = 0 }) {
    const [rejectId, setRejectId] = useState(null);
    const [rejectNote, setRejectNote] = useState("");
    const [loadingId, setLoadingId] = useState(null);
    const [lightbox, setLightbox] = useState(null);

    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);

    const hasActiveFilter = search || dateFrom || dateTo;

    const clearFilters = () => {
        setSearch("");
        setDateFrom("");
        setDateTo("");
    };

    const approve = async (id) => {
        if (!confirm("So'rovni tasdiqlashni xohlaysizmi?")) return;
        setLoadingId(id);
        try {
            await axios.post(`/manual-topups/${id}/approve`);
            router.reload({ only: ["requests", "pending"] });
        } catch (e) {
            alert(e.response?.data?.message ?? "Xatolik yuz berdi");
        } finally {
            setLoadingId(null);
        }
    };

    const openReject = (id) => {
        setRejectId(id);
        setRejectNote("");
    };

    const submitReject = async () => {
        if (!rejectId) return;
        setLoadingId(rejectId);
        try {
            await axios.post(`/manual-topups/${rejectId}/reject`, { notes: rejectNote });
            setRejectId(null);
            router.reload({ only: ["requests", "pending"] });
        } catch (e) {
            alert(e.response?.data?.message ?? "Xatolik yuz berdi");
        } finally {
            setLoadingId(null);
        }
    };

    const sorted = [...requests]
        .filter((r) => {
            const matchName = r.username.toLowerCase().includes(search.trim().toLowerCase());
            const created = new Date(r.created_at);
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
            const matchFrom = !from || created >= from;
            const matchTo = !to || created <= to;
            return matchName && matchFrom && matchTo;
        })
        .sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (b.status === "pending" && a.status !== "pending") return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });

    const totalAmount = requests.reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const approvedCount = requests.filter((r) => r.status === "approved").length;

    return (
        <>
            <Head title="Manual Topuplar" />

            {/* ── Reject modal ── */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                <XCircle className="size-5 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Rad etish</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Sabab ko'rsating (ixtiyoriy)</p>
                            </div>
                        </div>
                        <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            rows={3}
                            placeholder="Masalan: chek noto'g'ri, summa mos emas..."
                            className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900/50 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setRejectId(null)}
                                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Bekor
                            </button>
                            <button
                                type="button"
                                onClick={submitReject}
                                disabled={!!loadingId}
                                className="flex-1 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold disabled:opacity-50 transition-colors shadow-sm shadow-rose-200 dark:shadow-rose-900/20"
                            >
                                {loadingId ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="size-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Yuklanmoqda
                                    </span>
                                ) : "Rad etish"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Lightbox ── */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    onClick={() => setLightbox(null)}
                >
                    <img
                        src={lightbox}
                        alt="Chek"
                        className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        type="button"
                        onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 size-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/20"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}

            <div className="w-full min-w-0 space-y-5">

                {/* ── Stats row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard
                        icon={AlertCircle}
                        label="Kutilmoqda"
                        value={pending}
                        color="bg-gradient-to-br from-amber-400 to-orange-500"
                        sub={pending > 0 ? "Ko'rib chiqish kerak" : "Hammasini ko'rib chiqdingiz"}
                    />
                    <StatCard
                        icon={Receipt}
                        label="Jami so'rovlar"
                        value={requests.length}
                        color="bg-gradient-to-br from-blue-500 to-indigo-600"
                        sub={hasActiveFilter ? `${sorted.length} ta filtrlangan` : "Barcha vaqt"}
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Tasdiqlangan"
                        value={approvedCount}
                        color="bg-gradient-to-br from-emerald-400 to-teal-500"
                        sub={`${requests.length ? Math.round((approvedCount / requests.length) * 100) : 0}% tasdiqlangan`}
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Jami summa"
                        value={totalAmount.toLocaleString("fr-FR")}
                        color="bg-gradient-to-br from-violet-500 to-purple-600"
                        sub="UZS barcha so'rovlar"
                    />
                </div>

                {/* ── Header + filters ── */}
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
                    {/* Title row */}
                    <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="size-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30 shrink-0">
                                <Receipt className="size-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base font-bold text-slate-800 dark:text-white leading-tight truncate">
                                    Manual Topuplar
                                </h1>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    {pending > 0 ? (
                                        <span className="text-amber-500 font-semibold">{pending} ta kutilmoqda</span>
                                    ) : (
                                        <span>Jami {requests.length} ta so'rov{hasActiveFilter && sorted.length !== requests.length && <span className="text-blue-500 ml-1">· {sorted.length} ta ko'rsatilmoqda</span>}</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Mobile filter toggle */}
                        <button
                            type="button"
                            onClick={() => setFiltersOpen((v) => !v)}
                            className={`
                                lg:hidden relative flex items-center gap-1.5 px-3 h-8 rounded-xl border text-xs font-semibold transition-all shrink-0
                                ${filtersOpen || hasActiveFilter
                                    ? "border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500"
                                    : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }
                            `}
                        >
                            <Filter className="size-3.5" />
                            Filter
                            {hasActiveFilter && (
                                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-blue-500" />
                            )}
                        </button>
                    </div>

                    {/* Desktop filter bar */}
                    <div className="hidden lg:flex items-center gap-2.5 px-4 py-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-1 min-w-48 max-w-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 h-9 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all">
                            <Search className="size-3.5 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Foydalanuvchi nomi..."
                                className="bg-transparent outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400 w-full"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 h-9 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                            <Calendar className="size-3.5 text-slate-400 shrink-0" />
                            <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 cursor-pointer" />
                        </div>

                        <span className="text-slate-300 dark:text-slate-600 text-sm">→</span>

                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 h-9 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                            <Calendar className="size-3.5 text-slate-400 shrink-0" />
                            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 cursor-pointer" />
                        </div>

                        {hasActiveFilter && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="size-3.5" />
                                Tozalash
                            </button>
                        )}
                    </div>

                    {/* Mobile filter panel */}
                    <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${filtersOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-slate-100 dark:border-slate-700/60">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Foydalanuvchi</label>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 h-10 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                                    <Search className="size-4 text-slate-400 shrink-0" />
                                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Foydalanuvchi nomi..." className="bg-transparent outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400 w-full" />
                                    {search && <button type="button" onClick={() => setSearch("")}><X className="size-4 text-slate-400" /></button>}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Sana oralig'i</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 h-10 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                                        <Calendar className="size-4 text-slate-400 shrink-0" />
                                        <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 w-full cursor-pointer" />
                                    </div>
                                    <span className="text-slate-300 text-sm">→</span>
                                    <div className="flex items-center gap-2 flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 h-10 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                                        <Calendar className="size-4 text-slate-400 shrink-0" />
                                        <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 w-full cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                {hasActiveFilter && (
                                    <button type="button" onClick={clearFilters} className="flex items-center justify-center gap-1.5 flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        <X className="size-4" /> Tozalash
                                    </button>
                                )}
                                <button type="button" onClick={() => setFiltersOpen(false)} className="flex items-center justify-center gap-1.5 flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                                    Qo'llash
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Cards ── */}
                {sorted.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-16 text-center shadow-sm">
                        <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                            <Receipt className="size-7 text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">
                            {hasActiveFilter ? "Filtr bo'yicha so'rovlar topilmadi" : "Hozircha so'rovlar yo'q"}
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">
                            {hasActiveFilter ? "Boshqa parametrlar bilan urinib ko'ring" : "Yangi so'rovlar bu yerda ko'rinadi"}
                        </p>
                        {hasActiveFilter && (
                            <button type="button" onClick={clearFilters} className="mt-4 px-4 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                Filterlarni tozalash
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {sorted.map((r) => (
                            <TopupCard
                                key={r.id}
                                r={r}
                                onApprove={approve}
                                onReject={openReject}
                                loadingId={loadingId}
                                onLightbox={setLightbox}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
