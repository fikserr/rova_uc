import { Head, useForm, usePage } from "@inertiajs/react"
import { AlertCircle, CheckCircle, Sparkles, Star, X } from "lucide-react"
import { useState } from "react"
import TopBar from "../../Components/TopBar"
import ProductCard from "../../Components/ui/ProductCard"

export default function Services() {
    const { services, flash, currencies = [] } = usePage().props;
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [choosedServiceType, setChoosedServiceType] = useState("stars");

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
        service_type: "stars",
        value: "",
        sell_price: "",
        cost_price: "",
        cost_currency: "USD",
        is_active: true,
    });

    const editService = (service) => {
        setEditing(service.id);
        setData({
            title: service.title,
            service_type: service.service_type,
            value: service.value,
            sell_price: service.sell_price,
            cost_price: service.cost_price,
            cost_currency: service.cost_currency,
            is_active: service.is_active,
        });
        setChoosedServiceType(service.service_type);
        setFormOpen(true);
    };

    const deleteService = (id) => {
        if (!confirm("O'chirmoqchimisiz?")) return;
        destroy(route("services.destroy", id));
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            put(route("services.update", editing), {
                onSuccess: () => { reset(); setEditing(null); setFormOpen(false); },
            });
        } else {
            post(route("services.store"), {
                onSuccess: () => { reset(); setEditing(null); setFormOpen(false); },
            });
        }
    };

    return (
        <div className="space-y-6">
            <Head>
                <title>Telegram Services</title>
                <meta name="description" content="Telegram Services Management" />
            </Head>

            <TopBar
                pageFor="services"
                setEditing={setEditing}
                setFormOpen={setFormOpen}
                reset={reset}
            />

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

            {/* Services grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {services.length > 0 ? (
                    services.map((service) => (
                        <ProductCard
                            cardFor="services"
                            key={service.id}
                            product={service}
                            onEdit={editService}
                            onDelete={deleteService}
                        />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-semibold">Xizmatlar yo'q</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Yangi xizmat qo'shish uchun "Add Product" tugmasini bosing</p>
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
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 rounded-t-2xl z-10">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm">
                                    ⚡
                                </div>
                                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                    {editing ? "Service tahrirlash" : "Service qo'shish"}
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

                        {/* Body */}
                        <form onSubmit={submit} className="p-6 space-y-4">

                            {/* Service type toggle */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Mahsulot turi
                                </label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
                                    {[
                                        { value: "stars", label: "⭐ Stars", icon: Star },
                                        { value: "premium", label: "✨ Premium", icon: Sparkles },
                                    ].map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => {
                                                setData("service_type", type.value);
                                                setChoosedServiceType(type.value);
                                            }}
                                            className={`h-9 rounded-lg text-sm font-semibold transition-all ${
                                                choosedServiceType === type.value
                                                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                            }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Mahsulot nomi
                                </label>
                                <input
                                    type="text"
                                    placeholder={choosedServiceType === "stars" ? "Masalan: 50 Stars" : "Masalan: 1 oy Premium"}
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                />
                                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    {choosedServiceType === "stars" ? "Stars miqdori" : "Premium muddati (oy)"}
                                </label>
                                <input
                                    type="number"
                                    placeholder={choosedServiceType === "stars" ? "50" : "1"}
                                    value={data.value}
                                    onChange={(e) => setData("value", e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Sell price + Cost price side by side */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        Sotuv narxi (UZS)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={data.sell_price}
                                        onChange={(e) => setData("sell_price", e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        Tan narxi
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={data.cost_price}
                                        onChange={(e) => setData("cost_price", e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Valyuta
                                </label>
                                <select
                                    value={data.cost_currency}
                                    onChange={(e) => setData("cost_currency", e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all cursor-pointer"
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
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Xizmat do'konda ko'rinadi</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData("is_active", !data.is_active)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${data.is_active ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow transition-transform ${data.is_active ? "translate-x-6" : "translate-x-0"}`} />
                                </button>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-sm font-bold disabled:opacity-50 transition-all shadow-sm shadow-amber-200 dark:shadow-amber-900/30 flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Saqlanmoqda...
                                    </>
                                ) : (editing ? "Yangilash" : "Saqlash")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
