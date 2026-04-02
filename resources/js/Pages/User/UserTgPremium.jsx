import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, CheckCircle, Shield, XIcon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import UserProductCard from "../../Components/ui/UserProductCard";

function UserTgPremium() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("click");
    const [targetTelegramUsername, setTargetTelegramUsername] = useState("");
    const { services, flash, user, lastTargetTelegramUsername } = usePage().props;

    const userBalance = Number(user?.balance ?? 0);

    const service = {
        title: "TELEGRAM premium do'koni",
        subtitle: "premium to'plami",
        icon: "🎮",
        color: "from-blue-500 to-blue-500",
    };

    useEffect(() => {
        if (!selectedProduct) return;

        const enough = userBalance >= Number(selectedProduct.sell_price ?? 0);
        setPaymentMethod(enough ? "balance" : "click");
    }, [selectedProduct, userBalance]);

    useEffect(() => {
        if (!selectedProduct) return;
        setTargetTelegramUsername(String(lastTargetTelegramUsername ?? ""));
    }, [selectedProduct, lastTargetTelegramUsername]);

    const handlePurchase = async () => {
        if (!selectedProduct || isSubmitting) return;

        setIsSubmitting(true);

        try {
            if (!targetTelegramUsername.trim()) {
                alert("Target Telegram username kiriting");
                return;
            }

            const response = await axios.post("/payment/create", {
                telegram_id: user?.id,
                payment_method: paymentMethod,
                order_type: "service",
                service_id: selectedProduct.id,
                target_telegram_username: targetTelegramUsername.trim(),
            });

            if (response?.data?.paid_with === "balance") {
                alert("Buyurtma balansdan muvaffaqiyatli to'landi");
                setSelectedProduct(null);
                window.location.reload();
                return;
            }

            const paymentUrl = response?.data?.payment_url;

            if (paymentUrl) {
                window.location.href = paymentUrl;
                return;
            }

            alert("To'lov havolasi olinmadi");
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Buyurtma yuborishda xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)]  px-4 py-6 pb-8 lg:pb-8 dark:bg-slate-900">
            <Head title="Premium shop" />
            {flash?.success && (
                <div className="p-3 bg-green-100 text-green-700 rounded">
                    {flash.success}
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Link href={"/user-services"}>
                    <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 hover:dark:text-slate-100 mb-6 transition-colors group ">
                        <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Orqaga</span>
                    </button>
                </Link>

                {/* Service Header */}
                <div
                    className={`bg-linear-to-r ${service.color} rounded-3xl p-6 sm:p-8 mb-8 shadow-xl`}
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl text-4xl">
                            {service.icon}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                                {service.title}
                            </h1>
                            <p className="text-white/90 text-sm sm:text-base">
                                {service.subtitle}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="grid sm:grid-cols-3 gap-3 text-white text-sm">
                            <div className="flex items-center gap-2">
                                <Zap className="size-4" />
                                <span>Tezkor yetkazib berish</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="size-4" />
                                <span>100% xavfsiz</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="size-4" />
                                <span>24/7 qo'llab-quvvatlash</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                        Paketni tanlang
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map(
                            (s) =>
                                s.service_type == "premium" && (
                                    <UserProductCard
                                        product={{
                                            type: "tg",
                                            service_type: s.service_type,
                                            value: s.value,
                                            sell_price: s.sell_price,
                                            sell_currency: s.sell_currency,
                                        }}
                                        onClick={setSelectedProduct.bind(
                                            null,
                                            s,
                                        )}
                                        key={s.id}
                                    />
                                ),
                        )}
                    </div>
                </div>

                {/* Purchase Summary */}
                {selectedProduct && (
                    <div className="w-full h-full z-99999 bg-black/90 fixed top-0 left-0 flex items-center justify-center">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100 animate-in fade-in w-full max-w-lg relative">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">
                                Buyurtma xulosasi
                            </h3>
                            <button
                                className="bg-transparent outline-0 absolute top-4 right-6 cursor-pointer hover:text-red-500 transition-all focus:text-red-500"
                                onClick={() => setSelectedProduct(null)}
                            >
                                <XIcon />
                            </button>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">
                                        Mahsulot:
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {selectedProduct.value % 12 == 0
                                            ? `${selectedProduct.value / 12} yillik premium`
                                            : `${selectedProduct.value} oylik premium`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">
                                        Kimga:
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {user.username}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-slate-600 text-sm">
                                        Target Telegram Username
                                    </label>
                                    <input
                                        type="text"
                                        value={targetTelegramUsername}
                                        onChange={(e) => setTargetTelegramUsername(e.target.value)}
                                        placeholder="Masalan: username yoki @username"
                                        className="mt-1 w-full h-11 rounded-xl border border-slate-300 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {selectedProduct.bonus && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">
                                            Bonus:
                                        </span>
                                        <span className="font-semibold text-emerald-600">
                                            {selectedProduct.bonus}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                    <span className="text-slate-900 font-bold text-lg">
                                        Jami:
                                    </span>
                                    <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        {Number(
                                            Math.floor(
                                                selectedProduct.sell_price,
                                            ),
                                        ).toLocaleString("fr-FR", {
                                            maximumFractionDigits: 4, // keeps up to 4 decimals if needed
                                        })}{" "}
                                        {selectedProduct.sell_currency}
                                    </span>
                                </div>
                            </div>
                            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-sm text-slate-600 mb-2">
                                    Balans: <strong>{Number(userBalance).toLocaleString("fr-FR")} UZS</strong>
                                </p>
                                {userBalance >= Number(selectedProduct.sell_price ?? 0) ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("balance")}
                                            className={`h-10 rounded-xl text-sm font-semibold ${paymentMethod === "balance" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}
                                        >
                                            Balansdan to'lash
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("click")}
                                            className={`h-10 rounded-xl text-sm font-semibold ${paymentMethod === "click" ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}
                                        >
                                            Click orqali
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-amber-700">
                                        Balans yetarli emas, Click orqali to'lov ishlatiladi.
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handlePurchase}
                                disabled={isSubmitting}
                                className="w-full h-14 text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg rounded-2xl text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Yuborilmoqda..." : "Xarid qilish"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 dark:text-white">
                        <Shield className="size-5 text-blue-600" />
                        Muhim ma'lumot
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li>
                            • Yetkazib berish 1-5 daqiqa ichida amalga
                            oshiriladi
                        </li>
                        <li>• Barcha to'lovlar 100% xavfsiz va himoyalangan</li>
                        <li>
                            • Muammolar yuzaga kelsa, 24/7 qo'llab-quvvatlash
                            mavjud
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default UserTgPremium;
