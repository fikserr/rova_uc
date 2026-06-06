import { Head, useForm, usePage } from "@inertiajs/react"
import { AlertCircle, CheckCircle, X } from "lucide-react"
import { useState } from "react"
import TopBar from "../../Components/TopBar"
import ProductCard from "../../Components/ui/productCard"

export default function UcProducts() {
    const { products, flash, currencies = [] } = usePage().props;
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        title: "",
        uc_amount: "",
        sell_price: "",
        cost_price: "",
        cost_currency: "",
        is_active: true,
    });

    const editProduct = (product) => {
        setEditing(product.id);
        setData({
            title: product.title,
            uc_amount: product.uc_amount,
            sell_price: product.sell_price,
            cost_price: product.cost_price,
            cost_currency: product.cost_currency,
            is_active: product.is_active,
        });
        setFormOpen(true);
    };

    const deleteProduct = (id) => {
        if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return;
        destroy(route("uc-products.destroy", id));
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            put(route("uc-products.update", editing), {
                onSuccess: () => { reset(); setEditing(null); setFormOpen(false); },
            });
        } else {
            post(route("uc-products.store"), {
                onSuccess: () => { reset(); setEditing(null); setFormOpen(false); },
            });
        }
    };

    return (
        <div className="space-y-6">
            <Head>
                <title>Pubg Mobile UC</title>
                <meta name="description" content="UC Products Management" />
            </Head>

            <TopBar
                pageFor="uc"
                setEditing={setEditing}
                setFormOpen={setFormOpen}
                reset={reset}
            />

            {/* Flash message */}
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

            {/* Products grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard
                            cardFor="uc"
                            key={product.id}
                            product={product}
                            onEdit={editProduct}
                            onDelete={deleteProduct}
                        />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <span className="text-2xl">🎮</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-semibold">Mahsulotlar yo'q</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Yangi mahsulot qo'shish uchun "Add Product" tugmasini bosing</p>
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
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700"
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm">
                                    🎮
                                </div>
                                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                    {editing ? "UC tahrirlash" : "Yangi UC qo'shish"}
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

                        {/* Modal body */}
                        <form onSubmit={submit} className="p-6 space-y-4">

                            {/* Field helper */}
                            {[
                                { label: "Mahsulot nomi", key: "title", type: "text", placeholder: "Masalan: 60 UC" },
                                { label: "UC Miqdori", key: "uc_amount", type: "number", placeholder: "Masalan: 60" },
                                { label: "Sotuv narxi (UZS)", key: "sell_price", type: "number", placeholder: "0" },
                                { label: "Tan narxi", key: "cost_price", type: "number", placeholder: "0" },
                            ].map(({ label, key, type, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        placeholder={placeholder}
                                        value={data[key]}
                                        required
                                        onChange={(e) => setData(key, e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                    />
                                    {errors[key] && (
                                        <p className="text-xs text-rose-500 mt-1">{errors[key]}</p>
                                    )}
                                </div>
                            ))}

                            {/* Currency select */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Valyuta
                                </label>
                                <select
                                    value={data.cost_currency}
                                    onChange={(e) => setData("cost_currency", e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
                                >
                                    <option value="">Valyuta tanlang</option>
                                    {currencies.map((c) => (
                                        <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aktiv</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Mahsulot do'konda ko'rinadi</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData("is_active", !data.is_active)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${data.is_active ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow transition-transform ${data.is_active ? "translate-x-6" : "translate-x-0"}`} />
                                </button>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-bold disabled:opacity-50 transition-all shadow-sm shadow-blue-200 dark:shadow-blue-900/30 flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Saqlanmoqda...
                                    </>
                                ) : (
                                    editing ? "Yangilash" : "Saqlash"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
