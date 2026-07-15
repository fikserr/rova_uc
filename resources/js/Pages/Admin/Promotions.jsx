import { Head, router, usePage } from "@inertiajs/react";
import {
    Clock,
    Pencil,
    Plus,
    Power,
    Tag,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ── helpers ──────────────────────────────────────────────── */

function fmtDate(v) {
    if (!v) return "—";
    return new Date(v).toLocaleString("ru-RU", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

const APPLIES_LABELS = {
    all:     "Hammasi",
    uc:      "UC (PUBG)",
    service: "Telegram xizmatlari",
    sekali:  "SekalıPay",
};

const PRESET_COLORS = [
    "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
];

const inputCls =
    "w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all " +
    "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 " +
    "text-slate-900 dark:text-white placeholder-slate-400 " +
    "focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

const labelCls =
    "block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5";

/* ── Countdown ────────────────────────────────────────────── */

function calcRem(endsAt) {
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return null;
    return {
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
    };
}

function Countdown({ endsAt, isActive }) {
    const [rem, setRem] = useState(() => calcRem(endsAt));

    useEffect(() => {
        if (!isActive) return;
        const id = setInterval(() => setRem(calcRem(endsAt)), 1_000);
        return () => clearInterval(id);
    }, [endsAt, isActive]);

    if (!isActive || !rem)
        return <span className="text-xs text-slate-400">—</span>;

    return (
        <span className="font-mono text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            {rem.d > 0 && <>{rem.d}d </>}
            {String(rem.h).padStart(2, "0")}:
            {String(rem.m).padStart(2, "0")}:
            {String(rem.s).padStart(2, "0")}
        </span>
    );
}

/* ── Banner preview ───────────────────────────────────────── */

function BannerPreview({ color, title, percent }) {
    return (
        <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-semibold truncate"
            style={{ backgroundColor: color || "#7c3aed" }}
        >
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
                {title || "Aksiya"} — {percent ?? 0}% chegirma
            </span>
        </div>
    );
}

/* ── Modal ────────────────────────────────────────────────── */

const EMPTY = {
    title:            "",
    description:      "",
    discount_percent: 10,
    applies_to:       "all",
    starts_at:        "",
    ends_at:          "",
    banner_color:     "#7c3aed",
    is_active:        true,
};

function toLocal(dt) {
    if (!dt) return "";
    // Convert "2026-07-15T10:00:00.000000Z" → "2026-07-15T10:00"
    return new Date(dt).toISOString().slice(0, 16);
}

function PromotionModal({ promo, onClose }) {
    const isEdit = !!promo?.id;

    const [form, setForm] = useState(
        isEdit
            ? {
                title:            promo.title ?? "",
                description:      promo.description ?? "",
                discount_percent: promo.discount_percent ?? 10,
                applies_to:       promo.applies_to ?? "all",
                starts_at:        toLocal(promo.starts_at),
                ends_at:          toLocal(promo.ends_at),
                banner_color:     promo.banner_color ?? "#7c3aed",
                is_active:        promo.is_active ?? true,
            }
            : { ...EMPTY }
    );

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            router.put(`/promotions/${promo.id}`, form, {
                preserveScroll: true,
                onSuccess: onClose,
            });
        } else {
            router.post("/promotions", form, {
                preserveScroll: true,
                onSuccess: onClose,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
                    <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                        <Tag className="w-5 h-5 text-violet-500" />
                        {isEdit ? "Aksiyani tahrirlash" : "Yangi aksiya"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Live banner preview */}
                <div className="px-6 pt-4">
                    <BannerPreview
                        color={form.banner_color}
                        title={form.title}
                        percent={form.discount_percent}
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
                    {/* Title */}
                    <div>
                        <label className={labelCls}>Nomi *</label>
                        <input
                            type="text" maxLength={100} required
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            className={inputCls}
                            placeholder="Yoz aksiyasi"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelCls}>Tavsif</label>
                        <textarea
                            rows={2} maxLength={500}
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            className={inputCls}
                            placeholder="Qo'shimcha ma'lumot..."
                        />
                    </div>

                    {/* Discount + Applies to */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Chegirma % *</label>
                            <input
                                type="number" min={0} max={100} step={0.01} required
                                value={form.discount_percent}
                                onChange={(e) => set("discount_percent", e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Qo'llaniladi *</label>
                            <select
                                value={form.applies_to}
                                onChange={(e) => set("applies_to", e.target.value)}
                                className={inputCls}
                            >
                                <option value="all">Hammasi</option>
                                <option value="uc">UC (PUBG)</option>
                                <option value="service">Telegram xizmatlari</option>
                                <option value="sekali">SekalıPay</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Boshlanish *</label>
                            <input
                                type="datetime-local" required
                                value={form.starts_at}
                                onChange={(e) => set("starts_at", e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Tugash *</label>
                            <input
                                type="datetime-local" required
                                value={form.ends_at}
                                onChange={(e) => set("ends_at", e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Banner color */}
                    <div>
                        <label className={labelCls}>Banner rangi</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    type="button" key={c}
                                    onClick={() => set("banner_color", c)}
                                    title={c}
                                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                        form.banner_color === c
                                            ? "border-white scale-110 shadow-md"
                                            : "border-transparent"
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <input
                                type="color"
                                value={form.banner_color}
                                onChange={(e) => set("banner_color", e.target.value)}
                                title="Custom rang"
                                className="w-7 h-7 rounded-full border-2 border-slate-300 dark:border-slate-600 cursor-pointer bg-transparent"
                            />
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                {form.banner_color}
                            </span>
                        </div>
                    </div>

                    {/* is_active (edit only) */}
                    {isEdit && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) => set("is_active", e.target.checked)}
                                className="w-4 h-4 rounded accent-violet-600"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Faol holat
                            </span>
                        </label>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t dark:border-slate-700">
                        <button
                            type="button" onClick={onClose}
                            className="px-4 py-2 text-sm rounded-xl border dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Bekor
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm rounded-xl bg-violet-600 text-white hover:bg-violet-700 font-semibold"
                        >
                            {isEdit ? "Saqlash" : "Yaratish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Flash message ────────────────────────────────────────── */

function Flash() {
    const { flash = {} } = usePage().props;
    if (!flash.success && !flash.error) return null;
    const isOk = !!flash.success;
    return (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${
            isOk
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
        }`}>
            {flash.success || flash.error}
        </div>
    );
}

/* ── Main page ────────────────────────────────────────────── */

export default function Promotions() {
    const { promotions: initial = [] } = usePage().props;
    const [modal, setModal] = useState(null); // null | 'create' | promoObj

    const openCreate = () => setModal("create");
    const openEdit   = (p) => setModal(p);
    const closeModal = () => setModal(null);

    const toggle = (p) =>
        router.post(`/promotions/${p.id}/toggle`, {}, { preserveScroll: true });

    const destroy = (p) => {
        if (!confirm(`"${p.title}" aksiyasini o'chirmoqchimisiz?`)) return;
        router.delete(`/promotions/${p.id}`, { preserveScroll: true });
    };

    const now = Date.now();

    const isLive = (p) =>
        p.is_active &&
        new Date(p.starts_at) <= now &&
        new Date(p.ends_at) >= now;

    return (
        <>
            <Head title="Aksiyalar" />

            {modal && (
                <PromotionModal
                    promo={modal === "create" ? null : modal}
                    onClose={closeModal}
                />
            )}

            <div className="space-y-5">
                {/* Title bar */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Tag className="w-6 h-6 text-violet-500" />
                            Aksiyalar
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Mavsum aksiyalari va chegirmalar
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-violet-600 text-white hover:bg-violet-700 font-semibold shadow"
                    >
                        <Plus className="w-4 h-4" />
                        Yangi aksiya
                    </button>
                </div>

                <Flash />

                {/* Active banners preview */}
                {initial.filter(isLive).length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Hozir faol
                        </p>
                        {initial.filter(isLive).map((p) => (
                            <BannerPreview
                                key={p.id}
                                color={p.banner_color}
                                title={p.title}
                                percent={p.discount_percent}
                            />
                        ))}
                    </div>
                )}

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                            <tr>
                                {["Nomi", "Chegirma", "Qo'llaniladi", "Boshlanish", "Tugash", "Qoldi", "Faol", "Amallar"].map((h) => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {initial.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                                        Aksiyalar topilmadi
                                    </td>
                                </tr>
                            )}
                            {initial.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    {/* Name + banner color swatch */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-6 rounded-full shrink-0"
                                                style={{ backgroundColor: p.banner_color || "#7c3aed" }}
                                            />
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white">{p.title}</p>
                                                {p.description && (
                                                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{p.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    {/* Discount */}
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-violet-600 dark:text-violet-400">
                                            {p.discount_percent}%
                                        </span>
                                    </td>
                                    {/* Applies to */}
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {APPLIES_LABELS[p.applies_to] ?? p.applies_to}
                                        </span>
                                    </td>
                                    {/* Dates */}
                                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {fmtDate(p.starts_at)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {fmtDate(p.ends_at)}
                                    </td>
                                    {/* Countdown */}
                                    <td className="px-4 py-3">
                                        <Countdown endsAt={p.ends_at} isActive={isLive(p)} />
                                    </td>
                                    {/* Active toggle */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggle(p)}
                                            title={p.is_active ? "O'chirish" : "Yoqish"}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                p.is_active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                                    p.is_active ? "translate-x-4" : "translate-x-1"
                                                }`}
                                            />
                                        </button>
                                    </td>
                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                title="Tahrirlash"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => destroy(p)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                                title="O'chirish"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="lg:hidden space-y-3">
                    {initial.length === 0 && (
                        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                            <p className="text-slate-400">Aksiyalar topilmadi</p>
                        </div>
                    )}
                    {initial.map((p) => (
                        <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            {/* Color banner strip */}
                            <div
                                className="h-1.5 w-full"
                                style={{ backgroundColor: p.banner_color || "#7c3aed" }}
                            />
                            <div className="p-4 space-y-3">
                                {/* Title + badge */}
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">{p.title}</p>
                                        {p.description && (
                                            <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
                                        )}
                                    </div>
                                    <span className="shrink-0 text-lg font-extrabold text-violet-600 dark:text-violet-400">
                                        -{p.discount_percent}%
                                    </span>
                                </div>

                                {/* Meta */}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {APPLIES_LABELS[p.applies_to] ?? p.applies_to}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full font-medium ${
                                        p.is_active
                                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                            : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                                    }`}>
                                        {p.is_active ? "Faol" : "Nofaol"}
                                    </span>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <div>
                                        <span className="block text-[10px] uppercase font-semibold mb-0.5">Boshlanish</span>
                                        {fmtDate(p.starts_at)}
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase font-semibold mb-0.5">Tugash</span>
                                        {fmtDate(p.ends_at)}
                                    </div>
                                </div>

                                {/* Countdown */}
                                {isLive(p) && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2 flex items-center gap-2">
                                        <Countdown endsAt={p.ends_at} isActive={true} />
                                        <span className="text-xs text-amber-600 dark:text-amber-400">qoldi</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-1 border-t dark:border-slate-700">
                                    <button
                                        onClick={() => toggle(p)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                            p.is_active
                                                ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100"
                                                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100"
                                        }`}
                                    >
                                        <Power className="w-3.5 h-3.5" />
                                        {p.is_active ? "O'chirish" : "Yoqish"}
                                    </button>
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Tahrirlash
                                    </button>
                                    <button
                                        onClick={() => destroy(p)}
                                        className="flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
