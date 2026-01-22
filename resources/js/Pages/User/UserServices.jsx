import UserLayout from "@/Components/Layout/UserLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, Gamepad2, Star, TrendingUp } from "lucide-react";
import DiamondMain from "../../../../storage/app/public/mlbbDiamondMain.webp";
import TgPremium from "../../../../storage/app/public/tgPremium.webp";
import UcImage from "../../../../storage/app/public/ucMain.webp";

const services = [
    {
        id: "pubg",
        title: "PUBG MOBILE",
        subtitle: "UC to'plami",
        category: "O'yin valyutasi",
        image: UcImage,
        badge: "Mashhur",
        color: "from-orange-400 to-red-500",
        href: "/user-products-uc",
    },
    {
        id: "mlbb",
        title: "MOBILE LEGENDS",
        subtitle: "Diamond (Global)",
        category: "O'yin valyutasi",
        image: DiamondMain,
        badge: "Yangi",
        color: "from-purple-400 to-pink-500",
        href: "/user-products-ml",
    },
    {
        id: "tg-stars",
        title: "TELEGRAM STARS",
        subtitle: "Premium funksiyalar",
        category: "Telegram",
        icon: <Star className="size-20 fill-yellow-400 text-yellow-500" />,
        color: "from-blue-400 to-cyan-500",
        href: "/user-telegram-stars",
    },
    {
        id: "tg-premium",
        title: "TELEGRAM PREMIUM",
        subtitle: "Oylik obuna",
        category: "Telegram",
        image: TgPremium,
        badge: "Chegirma",
        color: "bg-linear-to-tr from-[#5595FE] via-[#6B84FF] to-[#9E71F7]",
        href: "/user-telegram-premium",
    },
];

/* ---------------- SERVICE CARD ---------------- */

function ServiceCard({
    title,
    subtitle,
    category,
    image,
    icon,
    badge,
    color,
    href,
}) {
    return (
        <Link
            href={href || "#"}
            className="group relative rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 block"
        >
            {/* Header */}
            <div className={`bg-linear-to-br ${color} p-6 pb-8 relative`}>
                {badge && (
                    <div className="absolute top-3 right-3 bg-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        {badge}
                    </div>
                )}

                {category && (
                    <div className="text-white/80 text-xs font-semibold mb-3 uppercase">
                        {category}
                    </div>
                )}

                <div className="flex items-center justify-center h-28">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className={`max-h-32 object-contain rounded-xl`}
                        />
                    ) : (
                        <div className="rounded-2xl">{icon}</div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 bg-white">
                <h3 className="font-bold text-lg mb-1 group-hover:text-blue-500 transition">
                    {title}
                </h3>

                {subtitle && (
                    <p className="text-sm text-gray-600 mb-3">{subtitle}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm font-semibold text-blue-500">
                        Sotib olish
                    </span>
                    <div className="bg-blue-500/10 p-2 rounded-full">
                        <ArrowRight className="size-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ---------------- PAGE ---------------- */

function UserServices() {
    return (
        <div className="min-h-screen px-4 py-10 md:py-6 pb-6 bg-transparent">
            <Head title="Xizmatlar" />
            <div className="max-w-7xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full mb-4 text-sm font-semibold shadow">
                        <TrendingUp className="size-4" />
                        Eng yaxshi narxlar
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Bizning Xizmatlar
                    </h1>

                    <p className="text-slate-600 max-w-2xl mx-auto">
                        O'yin valyutalari va Telegram xizmatlarini tez va
                        xavfsiz xarid qiling
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
                    {[
                        { value: "1000+", label: "Mijozlar" },
                        { value: "24/7", label: "Xizmat" },
                        { value: "5 min", label: "Yetkazib berish" },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className="bg-white rounded-2xl p-4 shadow text-center"
                        >
                            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                                {s.value}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <ServiceCard key={service.id} {...service} />
                    ))}
                </div>

                {/* Trust */}
                <div className="mt-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white text-center shadow-xl">
                    <Gamepad2 className="size-14 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-6">
                        Nima uchun bizni tanlash kerak?
                    </h2>

                    <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div>
                            <div className="text-4xl mb-2">⚡</div>
                            <h3 className="font-semibold mb-1">
                                Tezkor yetkazib berish
                            </h3>
                            <p className="text-blue-100 text-sm">
                                5 daqiqa ichida buyurtma
                            </p>
                        </div>
                        <div>
                            <div className="text-4xl mb-2">🔒</div>
                            <h3 className="font-semibold mb-1">
                                Xavfsiz to'lov
                            </h3>
                            <p className="text-blue-100 text-sm">
                                To'liq himoyalangan
                            </p>
                        </div>
                        <div>
                            <div className="text-4xl mb-2">💯</div>
                            <h3 className="font-semibold mb-1">
                                Eng yaxshi narx
                            </h3>
                            <p className="text-blue-100 text-sm">
                                Bozordagi eng arzon
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

UserServices.layout = (page) => <UserLayout>{page}</UserLayout>;
export default UserServices;
