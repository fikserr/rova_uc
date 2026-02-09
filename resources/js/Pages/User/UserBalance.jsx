import UserLayout from "@/Components/Layout/UserLayout";
import { Head } from "@inertiajs/react";
import {
    CheckCircle,
    Clock,
    CreditCard,
    Shield,
    TrendingDown,
} from "lucide-react";
import { useState } from "react";

function UserBalance() {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [amount, setAmount] = useState("");

    const paymentMethods = [
        {
            id: "uzb-som",
            label: "Uzb-Som",
            icon: "🇺🇿",
            provider: "Click / Payme",
            fee: "0%",
            time: "1-5 daqiqa",
            color: "from-green-400 to-emerald-500",
        },
        {
            id: "chet-eldan",
            label: "Chet eldan",
            icon: "💳",
            provider: "RuBank",
            fee: "2%",
            time: "5-15 daqiqa",
            color: "from-blue-400 to-indigo-500",
        },
    ];

    const handlePayment = () => {
        if (selectedMethod && amount && parseFloat(amount) >= 1) {
            console.log("Processing payment:", {
                method: selectedMethod,
                amount,
            });
        }
    };

    const isPaymentDisabled =
        !selectedMethod || !amount || parseFloat(amount) < 1;

    const selectedMethodData = paymentMethods.find(
        (m) => m.id === selectedMethod,
    );

    return (
        <>
            <Head title="Hisobni to‘ldirish" />

            <div
                className={`min-h-[calc(100vh-140px)] px-4 py-6 pb-24 lg:pb-8 transition-colors duration-300 dark:bg-linear-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50`}
            >
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8 lg:mb-10">
                        <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full mb-4 text-sm font-semibold shadow-lg">
                            <Shield className="size-4" />
                            <span>Xavfsiz to'lov tizimi</span>
                        </div>

                        <h1
                            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-linear-to-r bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300 from-slate-900 to-slate-700`}
                        >
                            Hisobni to'ldirish
                        </h1>

                        <p className="text-slate-600 dark:text-slate-200">
                            Qulay to'lov usulini tanlang
                        </p>
                    </div>

                    {/* Balance */}
                    <div
                        className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 mb-8 border dark:bg-slate-800/80 dark:border-slate-700 "bg-white/80 border-slate-100`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="dark:text-slate-400 text-slate-600">
                                    Joriy balans
                                </p>
                                <p className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    0 UZS
                                </p>
                            </div>
                            <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-4 sm:p-6 rounded-2xl">
                                <CreditCard className="size-10 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="mb-8">
                        <h2
                            className={`text-xl sm:text-2xl font-bold mb-6 dark:text-white text-slate-900`}
                        >
                            To'lov usulini tanlang
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`relative backdrop-blur-sm rounded-2xl p-6 text-left border-2 transition-all ${
                                        selectedMethod === method.id
                                            ? "border-blue-500 shadow-lg scale-[1.02]  "
                                            : "dark:bg-slate-800/80 dark:border-slate-700 bg-white/80 border-slate-100"
                                    }`}
                                >
                                    {selectedMethod === method.id && (
                                        <div className="absolute top-4 right-4 bg-blue-600 rounded-full p-1">
                                            <CheckCircle className="size-5 text-white" />
                                        </div>
                                    )}

                                    <div className="text-4xl mb-3 text-slate-800 dark:text-white">
                                        {method.icon}
                                    </div>
                                    <h3
                                        className={`text-xl font-bold dark:text-white  text-slate-900`}
                                    >
                                        {method.label}
                                    </h3>
                                    <p className="dark:text-slate-300 text-slate-900">
                                        {method.provider}
                                    </p>

                                    <div className="mt-4 space-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="size-4 text-emerald-500" />
                                            <span className='text-slate-800 dark:text-slate-50'>Komissiya: {method.fee}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="size-4 text-blue-500" />
                                            <span className='text-slate-800 dark:text-slate-50'>Vaqt: {method.time}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount */}
                    {selectedMethod && (
                        <div
                            className={`backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border dark:bg-slate-800/80 dark:border-slate-700 bg-white/80 border-slate-100 `}
                        >
                            <h3
                                className={`text-xl font-bold mb-4 dark:text-white text-slate-900 `}
                            >
                                Summa kiriting
                            </h3>

                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-16 text-2xl mb-4 w-full outline-0 border-b-2 dark:border-white dark:text-white"
                            />

                            <button
                                onClick={handlePayment}
                                disabled={isPaymentDisabled}
                                className="w-full h-14 text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl dark:text-white cursor-pointer"
                            >
                                To'lovni amalga oshirish
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
UserBalance.layout = (page) => <UserLayout>{page}</UserLayout>;

export default UserBalance;
