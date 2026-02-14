import MlbbDesktop from "@images/mlbb_desktop.webp";
import MlbbMobile from "@images/mlbb_mobile.webp";
import PubgDesktop from "@images/pubg_desktop.webp";
import PubgMobile from "@images/pubg_mobile.webp";
import TelegramPremium from "@images/telegram_premium.webp";
import TelegramStars from "@images/telegram_stars.webp";

import { Head, Link } from "@inertiajs/react";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import useDevice from "../../Hook/useDevice";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import DiamondMain from "@images/mlbbIcon.webp";
import UcImage from "@images/pubgmIcon.webp";
import TgPremium from "@images/tgPremium.webp";
import TgStars from "@images/tgStars.webp";

const customPaginationStyles = `
    .swiper-pagination-bullet {
        opacity: 1;
    }
    .swiper-pagination-bullet.swiper-pagination-bullet-active {
        background: white !important;
        width: 28px !important;
        border-radius: 6px !important;
    }
`;

const services = [
    {
        id: "pubg",
        title: "PUBG MOBILE",
        subtitle: "UC to'plami",
        category: "global",
        image: UcImage,
        badge: "Mashhur",
        color: "from-orange-400 to-red-500",
        href: "/user-products-uc",
    },
    {
        id: "mlbb",
        title: "MOBILE LEGENDS",
        subtitle: "Diamond (Global)",
        category: "Global",
        image: DiamondMain,
        badge: "Yangi",
        color: "from-purple-400 to-pink-500",
        href: "/user-products-ml",
    },
    {
        id: "tg-stars",
        title: "TELEGRAM STARS",
        subtitle: "Telegram Yulduzlari",
        category: "auto",
        color: "from-blue-400 to-cyan-500",
        image: TgStars,
        badge: "Eng yaxshi",
        href: "/user-telegram-stars",
    },
    {
        id: "tg-premium",
        title: "TELEGRAM PREMIUM",
        subtitle: "Oylik obuna",
        category: "auto",
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
            className="group relative rounded-3xl overflow-hidden bg-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 block
            dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-white/10"
        >
            {/* Header */}
            <div
                className={`bg-linear-to-br ${color} aspect-square w-full relative p-0`}
            >
                {badge && (
                    <div
                        className="absolute top-3 right-0 bg-white text-[8px] sm:text-xs font-bold px-3 py-1 rounded-l-full shadow
                                    dark:bg-slate-900 dark:text-slate-100"
                    >
                        {badge}
                    </div>
                )}

                {category && (
                    <div className="text-white/80 text-xs font-semibold mb-3 uppercase absolute top-10 right-0 bg-black/70 px-2 py-1 rounded-l-full backdrop-blur-sm">
                        {category}
                    </div>
                )}

                <div className="flex w-full items-center justify-center h-full p-0">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover rounded-t-2xl "
                        />
                    ) : (
                        <div className="rounded-2xl">{icon}</div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-800">
                <h3
                    className="font-bold text-xs sm:text-lg mb-1 transition
                            group-hover:text-blue-500
                            dark:text-slate-100 dark:group-hover:text-blue-400 "
                >
                    {title}
                </h3>

                {subtitle && (
                    <p className="text-xs text-gray-600 mb-3 dark:text-slate-400">
                        {subtitle}
                    </p>
                )}

                <div
                    className="md:flex items-center justify-between pt-3 border-t
                                dark:border-white/10 hidden "
                >
                    <span className=" text-xs sm:text-sm font-semibold text-blue-500 dark:text-blue-400">
                        Sotib olish
                    </span>
                    <div className="bg-blue-500/10 p-2 rounded-full dark:bg-blue-500/20">
                        <ArrowRight className="size-4 sm:size-4 text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ---------------- PAGE ---------------- */

function UserServices() {
    const mobile = useDevice() === "mobile";

    const Desktopimages = [
        {img:MlbbDesktop , href:"/user-products-ml" },
        {img:PubgDesktop , href:"/user-products-uc" },
        {img:TelegramStars , href:"/user-telegram-stars" },
        {img:TelegramPremium , href:"/user-telegram-premium" },
    ];
    const Mobileimages = [MlbbMobile, PubgMobile];
    const images = mobile ? Mobileimages : Desktopimages;
    return (
        <div className="min-h-screen px-4 py-10 md:py-6 pb-6 bg-transparent dark:bg-slate-950">
            <style>{customPaginationStyles}</style>
            <Head title="Xizmatlar" />

            <div className="max-w-7xl mx-auto">
                {/* Hero */}
                <div className="w-full mb-8 md:mb-12 ">
                    <Swiper
                        modules={[Pagination]}
                        slidesPerView={1}
                        pagination={{
                            clickable: true,
                            renderBullet: (index, className) => {
                                return `<button class="${className} custom-pagination-bullet" style="width: 10px; height: 10px; margin: 0 6px; border-radius: 50%; background: rgba(255,255,255,0.5); border: none; cursor: pointer; transition: all 0.3s ease;"></button>`;
                            },
                        }}
                        className="rounded-xl overflow-hidden shadow-lg"
                    >
                        {Desktopimages.map((img, index) => (
                            <SwiperSlide key={index}>
                                <Link href={img.href}>
                                    <div className="h-40 md:h-115 w-full">
                                        <img
                                            src={img.img}
                                            alt={`slide-${index}`}
                                            className="w-full h-full object-fill"
                                        />
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
                {/* Grid */}
                <div className="flex flex-col gap-6 md:gap-10 font-semibold font-mono">
                    <h1 className="text-3xl text-black dark:text-white">
                        Xizmatlar
                    </h1>
                    <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 sm:px-4 md:px-0 place-items-center">
                        {services.map((service) => (
                            <ServiceCard key={service.id} {...service} />
                        ))}
                    </div>
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

export default UserServices;
