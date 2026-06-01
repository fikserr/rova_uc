import { Head, router, usePage } from "@inertiajs/react";
import {
    CheckCircle,
    CreditCard,
    Pencil,
    Plus,
    ToggleLeft,
    ToggleRight,
    Trash2,
    X,
} from "lucide-react";
import { useState } from "react";

const BANK_COLORS = {
    Uzcard:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Humo:    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Visa:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    default: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

function bankColor(name) {
    return BANK_COLORS[name] ?? BANK_COLORS.default;
}

function formatCard(num) {
    return (num ?? "").replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}

function CardFormModal({ initial, onClose }) {
    const isEdit = !!initial?.id;
    const [form, setForm] = useState({
        card_number: initial?.card_number ?? "",
        card_holder: initial?.card_holder ?? "",
        bank_name:   initial?.bank_name ?? "",
        is_active:   initial?.is_active ?? true,
    });
    const [processing, setProcessing] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        const payload = { ...form };

        if (isEdit) {
            router.put(`/payment-cards/${initial.id}`, payload, {
                onFinish: () => { setProcessing(false); onClose(); },
            });
        } else {
            router.post("/payment-cards", payload, {
                onFinish: () => { setProcessing(false); onClose(); },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <CreditCard className="size-4 text-white" />
                        </div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">
                            {isEdit ? "Kartani tahrirlash" : "Yangi karta qo'shish"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Karta raqami <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.card_number}
                            onChange={(e) => set("card_number", e.target.value)}
                            placeholder="8600 1234 5678 9012"
                            maxLength={24}
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all font-mono
                                bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                                text-slate-900 dark:text-white placeholder-slate-400
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Karta egasi
                        </label>
                        <input
                            type="text"
                            value={form.card_holder}
                            onChange={(e) => set("card_holder", e.target.value)}
                            placeholder="JOHN DOE"
                            maxLength={100}
                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all uppercase
                                bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                                text-slate-900 dark:text-white placeholder-slate-400
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Bank nomi
                        </label>
                        <select
                            value={form.bank_name}
                            onChange={(e) => set("bank_name", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all
                                bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                                text-slate-900 dark:text-white
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">— Tanlang —</option>
                            <option value="Uzcard">Uzcard</option>
                            <option value="Humo">Humo</option>
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div
                            onClick={() => set("is_active", !form.is_active)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
                        >
                            <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {form.is_active ? "Aktiv" : "Aktiv emas"}
                        </span>
                    </label>

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
                            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-60 active:scale-95"
                        >
                            {processing ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Qo'shish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function PaymentCards({ cards }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', card }

    const handleDelete = (card) => {
        if (!confirm(`"${card.card_number}" kartasini o'chirishni tasdiqlaysizmi?`)) return;
        router.delete(`/payment-cards/${card.id}`);
    };

    const handleToggle = (card) => {
        router.put(`/payment-cards/${card.id}`, {
            card_number: card.card_number,
            card_holder: card.card_holder,
            bank_name:   card.bank_name,
            is_active:   !card.is_active,
        });
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Head title="To'lov Kartalari" />

            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                        <CreditCard className="size-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            To'lov Kartalari
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Foydalanuvchilar ko'radigan kartalar
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setModal({ mode: "add" })}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all active:scale-95 shadow-sm"
                >
                    <Plus className="size-4" />
                    Karta qo'shish
                </button>
            </div>

            {/* Flash */}
            {flash.success && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">{flash.success}</p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Jami kartalar</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{cards.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Aktiv kartalar</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {cards.filter((c) => c.is_active).length}
                    </p>
                </div>
            </div>

            {/* Cards list */}
            {cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
                    <CreditCard className="size-12 mb-3 opacity-40" />
                    <p className="text-sm font-medium">Hali karta qo'shilmagan</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className={`bg-white dark:bg-slate-800/80 rounded-2xl border shadow-sm overflow-hidden transition-all
                                ${card.is_active
                                    ? "border-slate-100 dark:border-slate-700/60"
                                    : "border-slate-200 dark:border-slate-700 opacity-60"
                                }`}
                        >
                            <div className="flex items-center gap-4 p-4">
                                {/* Card icon */}
                                <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${card.is_active ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`}>
                                    <CreditCard className="size-6 text-white" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-mono text-base font-bold text-slate-800 dark:text-white tracking-widest">
                                        {formatCard(card.card_number)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {card.card_holder && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                                                {card.card_holder}
                                            </span>
                                        )}
                                        {card.bank_name && (
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bankColor(card.bank_name)}`}>
                                                {card.bank_name}
                                            </span>
                                        )}
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                                            {card.is_active ? "Aktiv" : "Nofaol"}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleToggle(card)}
                                        title={card.is_active ? "Nofaol qilish" : "Faollashtirish"}
                                        className="size-9 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        {card.is_active
                                            ? <ToggleRight className="size-5 text-emerald-500" />
                                            : <ToggleLeft className="size-5 text-slate-400" />
                                        }
                                    </button>
                                    <button
                                        onClick={() => setModal({ mode: "edit", card })}
                                        title="Tahrirlash"
                                        className="size-9 rounded-xl flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(card)}
                                        title="O'chirish"
                                        className="size-9 rounded-xl flex items-center justify-center transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <CardFormModal
                    initial={modal.mode === "edit" ? modal.card : null}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}
