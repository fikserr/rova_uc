import UserLayout from "@/Components/Layout/UserLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, CheckCircle, Shield, Zap , XIcon } from "lucide-react";
import { useState } from "react";
import UserProductCard from "../../Components/ui/UserProductCard";

function UserTgPremium() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { services, flash, user } = usePage().props;

    const service = {
        title: "TELEGRAM premium do'koni",
        subtitle: "premium to'plami",
        icon: "🎮",
        color: "from-orange-500 to-red-500",
    };

    const handlePurchase = () => {
        setSelectedProduct(false);
    };

    console.log(services);

    return (
        <div className="min-h-[calc(100vh-140px)]  px-4 py-6 pb-8 lg:pb-8">
            <Head title="Premium shop" />
            {flash?.success && (
                <div className="p-3 bg-green-100 text-green-700 rounded">
                    {flash.success}
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Link href={"/user-services"}>
                    <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors group">
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
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
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
                            <button className='bg-transparent outline-0 absolute top-4 right-6 cursor-pointer hover:text-red-500 transition-all focus:text-red-500' onClick={()=>setSelectedProduct(null)}>
                                <XIcon/>
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
                            <button
                                onClick={handlePurchase}
                                className="w-full h-14 text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg rounded-2xl text-white"
                            >
                                Xarid qilish
                            </button>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <Shield className="size-5 text-blue-600" />
                        Muhim ma'lumot
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
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

UserTgPremium.layout = (page) => <UserLayout>{page}</UserLayout>;

export default UserTgPremium;
