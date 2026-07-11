import TelegramPremium from "@images/telegram_premium.webp";
import TelegramStars from "@images/telegram_stars.webp";

import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { ArrowRight, Gamepad2, Zap, ShieldCheck, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
            className="group relative rounded-2xl overflow-hidden bg-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 block
            dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-white/10"
        >
            {/* Header */}
            <div
                className={`bg-linear-to-br ${color} aspect-square w-full relative p-0`}
            >
                {badge && (
                    <div className="absolute top-3 right-0 bg-white text-[8px] sm:text-xs font-bold px-3 py-1 rounded-l-full shadow dark:bg-slate-900 dark:text-slate-100">
                        {badge}
                    </div>
                )}
                {category && (
                    <div className="text-white/80 md:text-xs text-[8px] font-semibold mb-1 uppercase absolute top-9 right-0 bg-black/60 px-2 py-1 rounded-l-full backdrop-blur-sm">
                        {category}
                    </div>
                )}
                <div className="flex w-full items-center justify-center h-full p-0">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover rounded-t-2xl"
                        />
                    ) : (
                        <div className="rounded-2xl">{icon}</div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="md:p-4 p-2 sm:p-5 bg-white dark:bg-slate-800">
                <h3 className="font-bold text-[6px] md:text-lg mb-1 transition group-hover:text-blue-500 dark:text-slate-100 dark:group-hover:text-blue-400">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-xs hidden md:block text-gray-600 mb-3 dark:text-slate-400">
                        {subtitle}
                    </p>
                )}
                <div className="md:flex items-center justify-between pt-3 border-t dark:border-white/10 hidden">
                    <span className="text-xs sm:text-sm font-semibold text-blue-500 dark:text-blue-400">
                        {/* buy label passed via prop */}
                        {/* handled in parent via t() */}
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
    const { t } = useTranslation();
    const [paymentNotice, setPaymentNotice] = useState("");

    const services = [
        {
            id: "shop",
            title: "GAME DO'KON",
            subtitle: t("shop.subtitle", "Barcha o'yin mahsulotlari"),
            category: "auto",
            icon: <Gamepad2 className="size-16 text-white/90" />,
            badge: t("services.badge_popular"),
            color: "from-violet-500 to-purple-700",
            href: "/shop",
        },
        {
            id: "tg-stars",
            title: "TELEGRAM STARS",
            subtitle: t("services.tg_stars_subtitle"),
            category: "auto",
            color: "from-blue-400 to-cyan-500",
            image: TgStars,
            badge: t("services.badge_best"),
            href: "/user-telegram-stars",
        },
        {
            id: "tg-premium",
            title: "TELEGRAM PREMIUM",
            subtitle: t("services.tg_premium_subtitle"),
            category: "auto",
            image: TgPremium,
            badge: t("services.badge_discount"),
            color: "bg-linear-to-tr from-[#5595FE] via-[#6B84FF] to-[#9E71F7]",
            href: "/user-telegram-premium",
        },
    ];

    const Desktopimages = [
        { img: TelegramStars, href: "/user-telegram-stars" },
        { img: TelegramPremium, href: "/user-telegram-premium" },
    ];

    useEffect(() => {
        const initStartParam =
            window.Telegram?.WebApp?.initDataUnsafe?.start_param;
        const query = new URLSearchParams(window.location.search);
        const queryStartParam =
            query.get("tgWebAppStartParam") ||
            query.get("startapp") ||
            query.get("start_param");

        const startParam = initStartParam || queryStartParam;
        const match = /^paid_(uc|ml|service)_(\d+)$/.exec(startParam || "");

        if (!match) return;

        const orderType = match[1];
        const orderId = Number(match[2]);
        let stopped = false;

        const poll = async (attempt = 0) => {
            if (stopped) return;
            try {
                const response = await axios.get("/payment/status", {
                    params: { order_type: orderType, order_id: orderId },
                });
                if (response?.data?.paid) {
                    setPaymentNotice(t("services.payment_confirmed"));
                    return;
                }
            } catch (error) {
                // retry on next poll
            }
            if (attempt >= 15) {
                setPaymentNotice(t("services.payment_checking"));
                return;
            }
            setTimeout(() => poll(attempt + 1), 2000);
        };

        poll();
        return () => {
            stopped = true;
        };
    }, []);

    return (
        <div className="min-h-screen px-4 py-10 md:py-6 pb-6 bg-transparent dark:bg-slate-950">
            <style>{customPaginationStyles}</style>
            <Head title={t("services.page_title")} />

            <div className="max-w-7xl mx-auto">
                {/* Payment notice */}
                {paymentNotice && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                        {paymentNotice}
                    </div>
                )}

                {/* Hero Swiper */}
                <div className="w-full mb-8 md:mb-12">
                    <Swiper
                        modules={[Pagination]}
                        slidesPerView={1}
                        pagination={{
                            clickable: true,
                            renderBullet: (index, className) =>
                                `<button class="${className} custom-pagination-bullet" style="width: 10px; height: 10px; margin: 0 6px; border-radius: 50%; background: rgba(255,255,255,0.5); border: none; cursor: pointer; transition: all 0.3s ease;"></button>`,
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

                {/* Services grid */}
                <div className="flex flex-col gap-4 md:gap-10 font-semibold font-mono">
                    <h1 className="text-xl 2xl:text-3xl text-black dark:text-white">
                        {t("services.title")}
                    </h1>
                    <div className="w-full grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-6 sm:px-4 md:px-0 place-items-center">
                        {services.map((service) => (
                            <ServiceCard key={service.id} {...service} />
                        ))}
                    </div>
                </div>

                {/* Trust section */}
                <div className="mt-16 rounded-3xl bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-sm p-8 sm:p-10 text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 mb-4">
                        <Gamepad2 className="size-7 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        {t("services.why_us_title")}
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 text-xs lg:text-sm mb-4 lg:mb-8">
                        {t("services.why_us_subtitle")}
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 lg:gap-4 max-w-2xl mx-auto">
                        {[
                            {
                                icon: Zap,
                                color: "bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400",
                                title: t("services.fast_delivery"),
                                desc: t("services.fast_delivery_desc"),
                            },
                            {
                                icon: ShieldCheck,
                                color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                title: t("services.secure_payment"),
                                desc: t("services.secure_payment_desc"),
                            },
                            {
                                icon: Tag,
                                color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                title: t("services.best_price"),
                                desc: t("services.best_price_desc"),
                            },
                        ].map(({ icon: Icon, color, title, desc }) => (
                            <div
                                key={title}
                                className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60 rounded-2xl py-3 px-2 lg:p-5 text-center"
                            >
                                <div
                                    className={`inline-flex items-center justify-center size-11 rounded-xl mb-3 ${color}`}
                                >
                                    <Icon className=" size-4 lg:size-5" />
                                </div>
                                <p className="text-[10px] lg:text-sm font-bold text-slate-800 dark:text-white mb-1">
                                    {title}
                                </p>
                                <p className="text-[8px] lg:text-xs text-slate-400 dark:text-slate-500">
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserServices;
