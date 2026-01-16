import AdminLayout from "@/Components/Layout/AdminLayout";
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
            onSuccess: () => reset(),
        });
    };
    const submitRate = (e) => {
        e.preventDefault();

        rateForm.post(route("currencies.rate.store"), {
            onSuccess: () => rateForm.reset(),
        });
    };

    console.log(currencies);

    return (
        <div className="p-6 space-y-8">
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
                    <h2 className="text-lg font-bold">Supported Currencies</h2>
                    <button onClick={()=>setFormCurrencyOpen(true)} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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

            {/* LIST */}
            {/* <table className="w-full bg-white rounded shadow text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th>Code</th>
                        <th>Nomi</th>
                        <th>Symbol</th>
                        <th>Base</th>
                        <th>Aktiv</th>
                        <th>Oxirgi kurs (UZS)</th>
                    </tr>
                </thead>
                <tbody>
                    {currencies.map((c) => (
                        <tr key={c.code} className="border-t">
                            <td className="font-bold">{c.code}</td>
                            <td>{c.name}</td>
                            <td>{c.symbol}</td>
                            <td>{c.is_base ? "✅" : "—"}</td>
                            <td>{c.is_active ? "Aktiv" : "Noaktiv"}</td>
                            <td>
                                {c.is_base
                                    ? "Base"
                                    : c.rates[0]?.rate_to_base ?? "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> */}
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
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    1 {currency.code} ={" "}
                                                    <span className="text-blue-600">
                                                        {currency.rates[0]
                                                            ?.rate_to_base ??
                                                            "—"}
                                                    </span>{" "}
                                                    UZS
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Last updated:{" "}
                                                    {
                                                        currency.rates[0]
                                                            .created_at
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setFormRateOpen(true);
                                            }}
                                            className="p-2 rounded-xl bg-[#155DFC] text-white flex items-center gap-1 text-base cursor-pointer  "
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Update Rate
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
                    onClick={() => setFormRateOpen(false)} // click outside closes modal
                    className="w-full h-full fixed top-0 left-0 bg-black/40 flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded shadow w-full max-w-lg"
                    >
                        <h2 className="font-semibold mb-3">
                            💱 Kurs yangilash
                        </h2>
                        <form onSubmit={submitRate} className="space-y-3">
                            <select
                                className="input"
                                value={rateForm.data.currency_code}
                                onChange={(e) =>
                                    rateForm.setData(
                                        "currency_code",
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">Valyutani tanlang</option>
                                {currencies
                                    .filter((c) => !c.is_base && c.is_active)
                                    .map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.code}
                                        </option>
                                    ))}
                            </select>
                            <input
                                className="input"
                                type="number"
                                step="0.0001"
                                placeholder="1 USD = ? UZS"
                                value={rateForm.data.rate_to_base}
                                onChange={(e) =>
                                    rateForm.setData(
                                        "rate_to_base",
                                        e.target.value
                                    )
                                }
                            />
                            <button
                                disabled={rateForm.processing}
                                className="w-full bg-green-600 text-white py-2 rounded"
                            >
                                Saqlash
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD FORM */}
            {formCurrencyOpen && (
                <div
                    onClick={() => setFormCurrencyOpen(false)} // click outside closes modal
                    className="w-full h-full fixed top-0 left-0 bg-black/40 flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded shadow w-full max-w-lg"
                    >
                        <h2 className="font-semibold mb-3">
                            ➕ Valyuta qo‘shish
                        </h2>
                        <form onSubmit={submit} className="space-y-3">
                            <input
                                className="input"
                                placeholder="Code (USD, EUR)"
                                value={data.code}
                                onChange={(e) =>
                                    setData(
                                        "code",
                                        e.target.value.toUpperCase()
                                    )
                                }
                            />
                            <input
                                className="input"
                                placeholder="Nomi"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                            <input
                                className="input"
                                placeholder="Symbol"
                                value={data.symbol}
                                onChange={(e) =>
                                    setData("symbol", e.target.value)
                                }
                            />
                            <label className="flex gap-2 items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_base}
                                    onChange={(e) =>
                                        setData("is_base", e.target.checked)
                                    }
                                />
                                Base valyuta
                            </label>
                            <button
                                disabled={processing}
                                className="w-full bg-blue-600 text-white py-2 rounded"
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
Currencies.layout = (page) => <AdminLayout>{page}</AdminLayout>;
