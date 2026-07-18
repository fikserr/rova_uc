import { Head, router, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    CheckCircle,
    ImageIcon,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import { useRef, useState } from "react";
import TopBar from "../../Components/TopBar";

export default function UcBundles() {
    const { bundles, flash, currencies = [] } = usePage().props;
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const fileRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const emptyForm = {
        title: "",
        sell_price: "",
        cost_price: "",
        cost_currency: "",
        sort_order: "0",
        is_active: true,
        visible_to_users: true,
        visible_to_resellers: true,
        image: null,
    };
    const [form, setForm] = useState(emptyForm);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setPreviewUrl(null);
        setErrors({});
        setFormOpen(true);
    };

    const openEdit = (bundle) => {
        setEditing(bundle.id);
        setForm({
            title: bundle.title,
            sell_price: String(bundle.sell_price),
            cost_price: String(bundle.cost_price),
            cost_currency: bundle.cost_currency,
            sort_order: String(bundle.sort_order ?? 0),
            is_active: bundle.is_active,
            visible_to_users: bundle.visible_to_users ?? true,
            visible_to_resellers: bundle.visible_to_resellers ?? true,
            image: null,
        });
        setPreviewUrl(bundle.image_url ?? null);
        setErrors({});
        setFormOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setForm((prev) => ({ ...prev, image: file }));
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("sell_price", form.sell_price);
        fd.append("cost_price", form.cost_price);
        fd.append("cost_currency", form.cost_currency);
        fd.append("sort_order", form.sort_order);
        fd.append("is_active", form.is_active ? "1" : "0");
        fd.append("visible_to_users", form.visible_to_users ? "1" : "0");
        fd.append("visible_to_resellers", form.visible_to_resellers ? "1" : "0");
        if (form.image) fd.append("image", form.image);

        const url = editing
            ? route("uc-bundles.update", editing)
            : route("uc-bundles.store");

        router.post(url, fd, {
            forceFormData: true,
            onSuccess: () => {
                setFormOpen(false);
                setEditing(null);
                setForm(emptyForm);
                setPreviewUrl(null);
            },
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = (id) => {
        if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return;
        router.delete(route("uc-bundles.destroy", id));
    };

    return (
        <div className="space-y-6">
            <Head title="To'plamlar" />

            <TopBar
                pageFor="bundles"
                setEditing={setEditing}
                setFormOpen={setFormOpen}
                reset={() => { setForm(emptyForm); setPreviewUrl(null); }}
            />

            {/* Flash */}
            {flash?.success && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle className="size-4 shrink-0" />
                    <span className="text-sm font-medium">{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400">
                    <AlertCircle className="size-4 shrink-0" />
                    <span className="text-sm font-medium">{flash.error}</span>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {bundles.length > 0 ? (
                    bundles.map((bundle) => (
                        <div
                            key={bundle.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm"
                        >
                            {/* Image */}
                            <div className="relative h-40 bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                                {bundle.image_url ? (
                                    <img
                                        src={bundle.image_url}
                                        alt={bundle.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="size-10 text-slate-300 dark:text-slate-600" />
                                )}
                                {!bundle.is_active && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">
                                            Nofaol
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1 truncate">
                                    {bundle.title}
                                </h3>
                                <p className="text-base font-bold text-blue-600 dark:text-blue-400 mb-3">
                                    {Number(bundle.sell_price).toLocaleString(
                                        "fr-FR",
                                    )}{" "}
                                    UZS
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(bundle)}
                                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
                                    >
                                        <Pencil className="size-3.5" />
                                        Tahrirlash
                                    </button>
                                    <button
                                        onClick={() => handleDelete(bundle.id)}
                                        className="flex items-center justify-center size-8 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <span className="text-2xl">🎁</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-semibold">
                            To'plamlar yo'q
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                            Yangi to'plam qo'shish uchun "Yangi to'plam"
                            tugmasini bosing
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {formOpen && (
                <div
                    onClick={() => setFormOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm">
                                    🎁
                                </div>
                                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                    {editing
                                        ? "To'plamni tahrirlash"
                                        : "Yangi to'plam"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                className="size-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Image upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Rasm
                                </label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="relative h-36 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors overflow-hidden"
                                >
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <ImageIcon className="size-8" />
                                            <span className="text-xs">
                                                Rasm tanlash uchun bosing
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {errors.image && (
                                    <p className="text-xs text-rose-500 mt-1">
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Nomi
                                </label>
                                <input
                                    type="text"
                                    placeholder="Masalan: 1 Oy Prime"
                                    value={form.title}
                                    required
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            title: e.target.value,
                                        }))
                                    }
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                />
                                {errors.title && (
                                    <p className="text-xs text-rose-500 mt-1">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Prices */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        Sotuv narxi (UZS)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={form.sell_price}
                                        required
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                sell_price: e.target.value,
                                            }))
                                        }
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                    />
                                    {errors.sell_price && (
                                        <p className="text-xs text-rose-500 mt-1">
                                            {errors.sell_price}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        Tan narxi
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={form.cost_price}
                                        required
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                cost_price: e.target.value,
                                            }))
                                        }
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                    />
                                    {errors.cost_price && (
                                        <p className="text-xs text-rose-500 mt-1">
                                            {errors.cost_price}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Tan narxi valyutasi
                                </label>
                                <select
                                    value={form.cost_currency}
                                    required
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            cost_currency: e.target.value,
                                        }))
                                    }
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
                                >
                                    <option value="">Valyuta tanlang</option>
                                    {currencies.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} — {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.cost_currency && (
                                    <p className="text-xs text-rose-500 mt-1">
                                        {errors.cost_currency}
                                    </p>
                                )}
                            </div>

                            {/* Sort order */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Tartib raqami
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={form.sort_order}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            sort_order: e.target.value,
                                        }))
                                    }
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Toggles */}
                            {[
                                { key: "is_active",            label: "Aktiv",               desc: "Do'konda ko'rinadi",               color: "bg-blue-600" },
                                { key: "visible_to_users",     label: "Userlarga ko'rinadi",  desc: "Oddiy foydalanuvchilar ko'radi",   color: "bg-emerald-500" },
                                { key: "visible_to_resellers", label: "Resellerga ko'rinadi", desc: "Reseller foydalanuvchilar ko'radi", color: "bg-violet-500" },
                            ].map(({ key, label, desc, color }) => (
                                <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, [key]: !p[key] }))}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${form[key] ? color : "bg-slate-300 dark:bg-slate-600"}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow transition-transform ${form[key] ? "translate-x-6" : "translate-x-0"}`} />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-bold disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Saqlanmoqda...
                                    </>
                                ) : editing ? (
                                    "Yangilash"
                                ) : (
                                    "Saqlash"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
