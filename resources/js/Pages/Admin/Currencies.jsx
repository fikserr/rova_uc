import { Head, useForm, usePage } from "@inertiajs/react"
import { Coins, Edit2, Plus, TrendingUp, X } from "lucide-react"
import { useState } from "react"

export default function Currencies() {
    const { currencies, flash } = usePage().props;
    const [formRateOpen, setFormRateOpen] = useState(false);
    const [formCurrencyOpen, setFormCurrencyOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        code: "",
        name: "",
        symbol: "",
    });

    const rateForm = useForm({
        currency_code: "",
        rate_to_base: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("currencies.store"), {
            onSuccess: () => {
                reset();
                setFormCurrencyOpen(false);
            },
        });
    };

    const submitRate = (e) => {
        e.preventDefault();
        rateForm.post(route("currencies.rate.store"), {
            onSuccess: () => {
                rateForm.reset();
                setFormRateOpen(false);
            },
        });
    };

    const baseCurrency = currencies.find((c) => c.is_base);

    return (
        <div className="p-0 md:p-6 space-y-8">
            <Head>
                <title>Currency Rates</title>
                <meta name="description" content="Your page description" />
            </Head>

            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Currency Management
                </h1>
                <p className="text-gray-500 dark:text-slate-400 text-base">
                    Manage exchange rates for multi-currency support
                </p>
            </div>

            {/* Flash */}
            {flash?.success && (
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 p-3 rounded-xl text-sm flex items-center gap-2">
                    <span>✓</span> {flash.success}
                </div>
            )}

            {/* Supported Currencies */}
            <div className="w-full flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700/60">
                <div className="w-full flex items-center justify-between">
                    <h2 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">
                        Supported Currencies
                    </h2>
                    <button
                        onClick={() => setFormCurrencyOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg text-xs md:text-sm font-medium transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Currency
                    </button>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...currencies]
                        .sort((a, b) => Number(b.is_base) - Number(a.is_base))
                        .map((currency) => (
                            <div
                                key={currency.code}
                                className={`p-4 rounded-xl border-2 ${
                                    currency.is_base
                                        ? "bg-blue-50 dark:bg-indigo-600/10 border-blue-200 dark:border-indigo-500/30"
                                        : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {currency.code}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">
                                            {currency.name}
                                        </p>
                                    </div>
                                    <div className="text-2xl text-gray-700 dark:text-slate-300">
                                        {currency.symbol}
                                    </div>
                                </div>
                                {currency.is_base && (
                                    <div className="mt-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-indigo-500/20 text-blue-800 dark:text-indigo-300">
                                            Base Currency
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </div>

            {/* Exchange Rates */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-700/60">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Exchange Rates (to {baseCurrency?.code})
                </h3>
                <div className="space-y-3">
                    {currencies.map((currency) => {
                        if (currency.is_base) return null;
                        return (
                            <div
                                key={currency.code}
                                className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-base font-semibold text-gray-900 dark:text-white mb-1">
                                            1 {currency.code} ={" "}
                                            <span className="text-blue-600 dark:text-indigo-400">
                                                {currency.rates[0]?.rate_to_base
                                                    ? Number(currency.rates[0].rate_to_base).toLocaleString("en-US", { maximumFractionDigits: 4 })
                                                    : "—"}
                                            </span>{" "}
                                            {baseCurrency?.code}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500">
                                            Last updated: {currency.rates[0]?.created_at ?? "—"}
                                        </p>
                                    </div>
                                    <button
                                        className="p-2 rounded-xl bg-blue-600 dark:bg-indigo-600 hover:bg-blue-700 dark:hover:bg-indigo-500 text-white flex items-center gap-1.5 text-xs md:text-sm font-medium transition-colors cursor-pointer"
                                        onClick={() => {
                                            rateForm.setData({
                                                currency_code: currency.code,
                                                rate_to_base: currency.rates[0]?.rate_to_base || "",
                                            });
                                            setFormRateOpen(true);
                                        }}
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        <span className="hidden md:block">Update Rate</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Update Rate Modal */}
            {formRateOpen && (
                <div
                    onClick={() => setFormRateOpen(false)}
                    className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-6"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 dark:from-indigo-500 dark:to-indigo-700 flex items-center justify-center text-white shadow-md">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Kurs yangilash
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                        Valyuta kursini tez va oson yangilang
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFormRateOpen(false)}
                                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={submitRate} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-400">
                                    Valyuta
                                </label>
                                <input
                                    type="text"
                                    value={rateForm.data.currency_code}
                                    disabled
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-gray-900 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 cursor-not-allowed text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-400">
                                    Kurs (1 {rateForm.data.currency_code} = ? {baseCurrency?.code})
                                </label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    placeholder="Masalan: 12500"
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-indigo-500 focus:border-blue-400 dark:focus:border-indigo-500 text-sm transition"
                                    value={rateForm.data.rate_to_base}
                                    onChange={(e) => rateForm.setData("rate_to_base", e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setFormRateOpen(false)}
                                    className="flex-1 rounded-2xl border border-gray-200 dark:border-slate-700 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    disabled={rateForm.processing}
                                    className="flex-1 rounded-2xl bg-linear-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 py-3 text-white font-semibold text-sm hover:from-green-600 hover:to-green-700 dark:hover:from-green-500 dark:hover:to-green-600 disabled:opacity-50 transition"
                                >
                                    Saqlash
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Currency Modal */}
            {formCurrencyOpen && (
                <div
                    onClick={() => setFormCurrencyOpen(false)}
                    className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 dark:from-indigo-500 dark:to-indigo-700 flex items-center justify-center text-white shadow-md">
                                    <Coins className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Valyuta qo'shish
                                </h2>
                            </div>
                            <button
                                onClick={() => setFormCurrencyOpen(false)}
                                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-3">
                            {[
                                { placeholder: "Code (USD, EUR)", key: "code", transform: (v) => v.toUpperCase() },
                                { placeholder: "Nomi", key: "name" },
                                { placeholder: "Symbol ($, €)", key: "symbol" },
                            ].map(({ placeholder, key, transform }) => (
                                <input
                                    key={key}
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-slate-800 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-indigo-500 focus:border-blue-400 dark:focus:border-indigo-500 text-sm transition"
                                    placeholder={placeholder}
                                    value={data[key]}
                                    onChange={(e) => setData(key, transform ? transform(e.target.value) : e.target.value)}
                                />
                            ))}

                            <p className="text-xs text-gray-400 dark:text-slate-500 pt-1">
                                Base valyuta doim {baseCurrency?.code}
                            </p>

                            <button
                                disabled={processing}
                                className="w-full rounded-2xl bg-linear-to-r from-blue-500 to-blue-600 dark:from-indigo-500 dark:to-indigo-600 py-3 text-white font-semibold text-sm hover:from-blue-600 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-indigo-700 disabled:opacity-50 transition mt-2"
                            >
                                Saqlash
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
