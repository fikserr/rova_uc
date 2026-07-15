import { Head, router, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    CheckCircle,
    Pencil,
    Percent,
    Plus,
    Tag,
    ToggleLeft,
    ToggleRight,
    Trash2,
    X,
} from "lucide-react";
import { useState } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val) {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function isExpired(val) {
    if (!val) return false;
    return new Date(val) < new Date();
}

// ── Input helpers ─────────────────────────────────────────────────────────────

const inputCls =
    "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all " +
    "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 " +
    "text-slate-900 dark:text-white placeholder-slate-400 " +
    "focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

const labelCls =
    "block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5";

// ── Form Modal ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
    code: "",
    discount_type: "percent",
    discount_value: "",
    min_order_amount: "",
    max_uses: "",
    expires_at: "",
};

function PromoFormModal({ initial, onClose }) {
    const isEdit = !!initial?.id;
    const [form, setForm] = useState({
        code: initial?.code ?? "",
        discount_type: initial?.discount_type ?? "percent",
        discount_value: initial?.discount_value ?? "",
        min_order_amount: initial?.min_order_amount ?? "",
        max_uses: initial?.max_uses ?? "",
        expires_at: initial?.expires_at
            ? initial.expires_at.slice(0, 10)
            : "",
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        setErrors((e) => ({ ...e, [k]: undefined }));
    };

    // Client-side validation
    const validate = () => {
        const e = {};
        if (!form.code.trim()) e.code = "Kod majburiy";
        else if (form.code.length > 50) e.code = "Maksimal 50 ta belgi";
        if (!form.discount_value && form.discount_value !== 0)
            e.discount_value = "Chegirma miqdori majburiy";
        else if (isNaN(Number(form.discount_value)) || Number(form.discount_value) < 0)
            e.discount_value = "Noto'g'ri qiymat";
        if (form.discount_type === "percent" && Number(form.discount_value) > 100)
            e.discount_value = "Foiz 100 dan oshmasin";
        if (form.min_order_amount !== "" && Number(form.min_order_amount) < 0)
            e.min_order_amount = "Noto'g'ri qiymat";
        if (form.max_uses !== "" && (isNaN(Number(form.max_uses)) || Number(form.max_uses) < 1))
            e.max_uses = "Kamida 1 ta bo'lishi kerak";
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setProcessing(true);

        const payload = {
            code: form.code.trim().toUpperCase(),
            discount_type: form.discount_type,
            discount_value: Number(form.discount_value),
            min_order_amount: form.min_order_amount !== "" ? Number(form.min_order_amount) : null,
            max_uses: form.max_uses !== "" ? Number(form.max_uses) : null,
            expires_at: form.expires_at || null,
        };

        const opts = {
            onError: (serverErrors) => {
                setErrors(serverErrors);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
            onSuccess: () => onClose(),
        };

        if (isEdit) {
            router.put(`/promo-codes/${initial.id}`, payload, opts);
        } else {
            router.post("/promo-codes", payload, opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Tag className="size-4 text-white" />
                        </div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">
                            {isEdit ? "Promo-kodni tahrirlash" : "Yangi promo-kod"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Code */}
                    <div>
                        <label className={labelCls}>
                            Kod <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => set("code", e.target.value.toUpperCase())}
                            placeholder="SUMMER20"
                            maxLength={50}
                            className={inputCls + (errors.code ? " border-red-400 focus:border-red-400 focus:ring-red-400/20" : "")}
                        />
                        {errors.code && (
                            <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                        )}
                    </div>

                    {/* Type + Value row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>
                                Chegirma turi <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={form.discount_type}
                                onChange={(e) => set("discount_type", e.target.value)}
                                className={inputCls}
                            >
                                <option value="percent">Foiz (%)</option>
                                <option value="fixed">Belgilangan (so'm)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>
                                Qiymat <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                value={form.discount_value}
                                onChange={(e) => set("discount_value", e.target.value)}
                                placeholder={form.discount_type === "percent" ? "20" : "5000"}
                                min={0}
                                step="any"
                                className={inputCls + (errors.discount_value ? " border-red-400 focus:border-red-400 focus:ring-red-400/20" : "")}
                            />
                            {errors.discount_value && (
                                <p className="mt-1 text-xs text-red-500">{errors.discount_value}</p>
                            )}
                        </div>
                    </div>

                    {/* Min order + Max uses row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Minimal buyurtma</label>
                            <input
                                type="number"
                                value={form.min_order_amount}
                                onChange={(e) => set("min_order_amount", e.target.value)}
                                placeholder="0"
                                min={0}
                                step="any"
                                className={inputCls + (errors.min_order_amount ? " border-red-400" : "")}
                            />
                            {errors.min_order_amount && (
                                <p className="mt-1 text-xs text-red-500">{errors.min_order_amount}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>Maks. foydalanish</label>
                            <input
                                type="number"
                                value={form.max_uses}
                                onChange={(e) => set("max_uses", e.target.value)}
                                placeholder="Cheksiz"
                                min={1}
                                step={1}
                                className={inputCls + (errors.max_uses ? " border-red-400" : "")}
                            />
                            {errors.max_uses && (
                                <p className="mt-1 text-xs text-red-500">{errors.max_uses}</p>
                            )}
                        </div>
                    </div>

                    {/* Expires at */}
                    <div>
                        <label className={labelCls}>Muddati (ixtiyoriy)</label>
                        <input
                            type="date"
                            value={form.expires_at}
                            onChange={(e) => set("expires_at", e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all disabled:opacity-60 active:scale-95"
                        >
                            {processing
                                ? "Saqlanmoqda..."
                                : isEdit
                                  ? "Saqlash"
                                  : "Qo'shish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PromoCodes({ codes }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', code }

    const handleToggle = (code) => {
        router.post(`/promo-codes/${code.id}/toggle`);
    };

    const handleDelete = (code) => {
        if (!confirm(`"${code.code}" promo-kodini o'chirishni tasdiqlaysizmi?`))
            return;
        router.delete(`/promo-codes/${code.id}`);
    };

    const activeCount = codes.filter((c) => c.is_active).length;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Head title="Promo Kodlar" />

            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-violet-900/40">
                        <Tag className="size-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            Promo Kodlar
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Chegirma kodlarini boshqarish
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setModal({ mode: "add" })}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all active:scale-95 shadow-sm"
                >
                    <Plus className="size-4" />
                    <span className="hidden lg:block">Kod qo'shish</span>
                </button>
            </div>

            {/* Flash */}
            {flash.success && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        {flash.success}
                    </p>
                </div>
            )}
            {flash.error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30">
                    <AlertCircle className="size-4 text-rose-500 shrink-0" />
                    <p className="text-sm text-rose-700 dark:text-rose-400">
                        {flash.error}
                    </p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        Jami kodlar
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {codes.length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        Aktiv
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {activeCount}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        Nofaol
                    </p>
                    <p className="text-2xl font-bold text-slate-500 dark:text-slate-400">
                        {codes.length - activeCount}
                    </p>
                </div>
            </div>

            {/* Table */}
            {codes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                    <Tag className="size-12 mb-3 opacity-40" />
                    <p className="text-sm font-medium">
                        Hali promo-kod qo'shilmagan
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700/60">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Kod
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Tur
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Qiymat
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Min. summa
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Foydalanish
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Holat
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Muddat
                                    </th>
                                    <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Amallar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                                {codes.map((c) => {
                                    const expired = isExpired(c.expires_at);
                                    const maxed =
                                        c.max_uses !== null &&
                                        c.uses_count >= c.max_uses;
                                    const inactive = !c.is_active || expired || maxed;

                                    return (
                                        <tr
                                            key={c.id}
                                            className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${inactive ? "opacity-60" : ""}`}
                                        >
                                            {/* Code */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono font-bold text-slate-800 dark:text-white tracking-wider bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg text-xs">
                                                    {c.code}
                                                </span>
                                            </td>

                                            {/* Type */}
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                        c.discount_type === "percent"
                                                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                    }`}
                                                >
                                                    {c.discount_type === "percent" ? (
                                                        <>
                                                            <Percent className="size-3" />
                                                            Foiz
                                                        </>
                                                    ) : (
                                                        "Belgilangan"
                                                    )}
                                                </span>
                                            </td>

                                            {/* Value */}
                                            <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                                                {c.discount_type === "percent"
                                                    ? `${c.discount_value}%`
                                                    : `${Number(c.discount_value).toLocaleString()} so'm`}
                                            </td>

                                            {/* Min order */}
                                            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                                                {c.min_order_amount
                                                    ? `${Number(c.min_order_amount).toLocaleString()} so'm`
                                                    : "—"}
                                            </td>

                                            {/* Uses */}
                                            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                                                <span
                                                    className={maxed ? "text-rose-500 font-semibold" : ""}
                                                >
                                                    {c.uses_count ?? 0}
                                                </span>
                                                {c.max_uses !== null && (
                                                    <span className="text-slate-400">
                                                        /{c.max_uses}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                {expired ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                        Muddati o'tgan
                                                    </span>
                                                ) : maxed ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                                        Tugagan
                                                    </span>
                                                ) : c.is_active ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        Aktiv
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                                        Nofaol
                                                    </span>
                                                )}
                                            </td>

                                            {/* Expires */}
                                            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                                                <span className={expired ? "text-orange-500" : ""}>
                                                    {formatDate(c.expires_at)}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleToggle(c)}
                                                        title={c.is_active ? "Nofaol qilish" : "Faollashtirish"}
                                                        className="size-8 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    >
                                                        {c.is_active ? (
                                                            <ToggleRight className="size-5 text-emerald-500" />
                                                        ) : (
                                                            <ToggleLeft className="size-5 text-slate-400" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setModal({ mode: "edit", code: c })}
                                                        title="Tahrirlash"
                                                        className="size-8 rounded-xl flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(c)}
                                                        title="O'chirish"
                                                        className="size-8 rounded-xl flex items-center justify-center transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <PromoFormModal
                    initial={modal.mode === "edit" ? modal.code : null}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}
