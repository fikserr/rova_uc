import { Head, useForm, usePage } from "@inertiajs/react";
import { Edit2 } from "lucide-react";
import { useState } from "react";
export default function Currencies() {
    const { currencies, flash } = usePage().props;
    const [formRateOpen, setFormRateOpen] = useState(false);
    const [formCurrencyOpen, setFormCurrencyOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        code: "",
        name: "",
        symbol: "",
        is_base: false,
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
    return (
        <div className="p-0 md:p-6 space-y-8">
            <Head>
                <title>Currency Rates</title>
                <meta name="description" content="Your page description" />
            </Head>
            <div className="w-full flex flex-col gap-1 ">
                <h1 className="text-3xl font-bold">Currency Management</h1>
                <p className="text-[#6A7282] text-base  ">
                    Manage exchange rates for multi-currency support
                </p>
            </div>

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-3 rounded">
                    {flash.success}
                </div>
            )}

            <div className="w-full flex flex-col gap-4 p-6 bg-white rounded-xl border-2 border-[#E5E7EB]">
                <div className="w-full flex items-center justify-between ">
                    <h2 className=" text-sm md:text-lg font-bold">
                        Supported Currencies
                    </h2>
                    <button
                        onClick={() => setFormCurrencyOpen(true)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs md:text-base"
                    >
                        + Add Currency
                    </button>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...currencies]
                        .sort((a, b) => Number(b.is_base) - Number(a.is_base))
                        .map((currency) => (
                            <div
                                key={currency.code}
                                className={`p-4 rounded-lg border-2 h-30 ${
                                    currency.is_base
                                        ? "bg-blue-50 border-blue-200"
                                        : "bg-gray-50 border-gray-200"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {currency.code}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {currency.name}
                                        </p>
                                    </div>
                                    <div className="text-2xl">
                                        {currency.symbol}
                                    </div>
                                </div>

                                {currency.is_base ? (
                                    <div className="mt-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            Base Currency
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Exchange Rates (to{" "}
                    {currencies.map((currency) => {
                        if (currency.is_base) {
                            return currency.code;
                        }
                    })}
                    )
                </h3>
                <div className="space-y-4">
                    {currencies.map((currency) => {
                        if (currency.is_base) return null;
                        return (
                            <div
                                key={currency.code}
                                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="text-xs md:text-lg font-semibold text-gray-900 mb-2 md:mb-0">
                                                    1 {currency.code} ={" "}
                                                    <span className="text-blue-600">
                                                        {currency.rates[0]
                                                            ?.rate_to_base
                                                            ? Number(
                                                                  currency
                                                                      .rates[0]
                                                                      .rate_to_base,
                                                              ).toLocaleString(
                                                                  "en-US",
                                                                  {
                                                                      maximumFractionDigits: 4, // keeps up to 4 decimals if needed
                                                                  },
                                                              )
                                                            : "—"}
                                                    </span>{" "}
                                                    UZS
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-500">
                                                    Last updated:{" "}
                                                    {currency.rates[0]
                                                        ?.created_at ?? "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className="p-2 rounded-xl bg-[#155DFC] text-white flex items-center gap-1 text-xs md:text-base cursor-pointer  "
                                            onClick={() => {
                                                // Pre-fill modal with existing rate
                                                rateForm.setData({
                                                    currency_code:
                                                        currency.code,
                                                    rate_to_base:
                                                        currency.rates[0]
                                                            ?.rate_to_base ||
                                                        "", // old rate
                                                });
                                                setFormRateOpen(true);
                                            }}
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            <span className="hidden md:block">
                                                {" "}
                                                Update Rate
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {formRateOpen && (
                <div
                    onClick={() => setFormRateOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-6 transform transition-transform duration-200"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl shadow-md">
                                💱
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Kurs yangilash
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Valyuta kursini tez va oson yangilang
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={submitRate} className="space-y-4">
                            {/* Currency info (disabled) */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    Valyuta
                                </label>
                                <input
                                    type="text"
                                    value={rateForm.data.currency_code}
                                    disabled
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            {/* Rate input */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    Kurs (1 {rateForm.data.currency_code} = ?
                                    UZS)
                                </label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    placeholder="Masalan: 12500"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm transition"
                                    value={rateForm.data.rate_to_base} // pre-filled value
                                    onChange={(e) =>
                                        rateForm.setData(
                                            "rate_to_base",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormRateOpen(false)}
                                    className="flex-1 rounded-2xl border border-gray-300 py-3 text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    disabled={rateForm.processing}
                                    className="flex-1 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 py-3 text-white font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition"
                                >
                                    Saqlash
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD FORM */}
            {formCurrencyOpen && (
                <div
                    onClick={() => setFormCurrencyOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6 transform transition-transform duration-200"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-md">
                                ➕
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Valyuta qo‘shish
                            </h2>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-4">
                            <input
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm transition"
                                placeholder="Code (USD, EUR)"
                                value={data.code}
                                onChange={(e) =>
                                    setData(
                                        "code",
                                        e.target.value.toUpperCase(),
                                    )
                                }
                            />
                            <input
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm transition"
                                placeholder="Nomi"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                            <input
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm transition"
                                placeholder="Symbol"
                                value={data.symbol}
                                onChange={(e) =>
                                    setData("symbol", e.target.value)
                                }
                            />

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_base}
                                    onChange={(e) =>
                                        setData("is_base", e.target.checked)
                                    }
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-400"
                                />
                                Base valyuta
                            </label>

                            <button
                                disabled={processing}
                                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition"
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
