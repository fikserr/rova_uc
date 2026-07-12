import MlbbDesktop from "@images/mlbb_desktop.webp";
import MlbbMobile from "@images/mlbb_mobile.webp";
import PubgDesktop from "@images/pubg_desktop.webp";
import PubgMobile from "@images/pubg_mobile.webp";
import TelegramPremium from "@images/telegram_premium.webp";
import TelegramStars from "@images/telegram_stars.webp";

import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { ArrowRight, Gamepad2, ShieldCheck, Tag, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import useDevice from "../../Hook/useDevice";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { accent, GameVariants } from "../../Components/user/GameVariants";
import PaymentCardsSwiper from "../../Components/user/PaymentCardsSwiper";

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

// Rotating gradients for the dynamic Game-category cards
const GAME_CARD_COLORS = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-sky-600",
    "from-red-500 to-orange-600",
    "from-lime-500 to-green-600",
];

const PINNED_GAMES = [
    "Mobile Legends",
    "Pubg Mobile",
    "Free Fire",
    "Delta Force",
    "Honor Of Kings",
];

function ServiceCard({
    title,
    subtitle,
    category,
    image,
    icon,
    badge,
    color,
    href,
    onClick,
}) {
    const className =
        "group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-2xl hover:shadow-violet-900/20 transition-all duration-300 hover:-translate-y-1 active:scale-95 block w-full text-left dark:bg-white/5 dark:shadow-none dark:ring-1 dark:ring-white/10 dark:hover:ring-violet-500/40";

    const content = (
        <>
            {/* Header */}
            <div
                className={`bg-linear-to-br ${color} aspect-square lg:aspect-auto lg:h-40 w-full relative p-0`}
            >
                {/* {badge && (
                    <div className="absolute top-3 right-0 bg-white text-[8px] sm:text-xs font-bold px-3 py-1 rounded-l-full shadow dark:bg-slate-900 dark:text-slate-100">
                        {badge}
                    </div>
                )} */}
                {category && (
                    <div className="text-white/80 md:text-xs text-[8px] font-semibold mb-1 uppercase absolute top-2 right-0 bg-black/60 px-2 py-1 rounded-l-full backdrop-blur-sm">
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
            <div className="p-3 pb-1 sm:p-4 bg-white dark:bg-white/5">
                <h3 className="uppercase text-[10px] sm:text-sm md:text-lg mb-1 leading-snug transition group-hover:text-violet-500 dark:text-slate-100 dark:group-hover:text-violet-400">
                    {title.length > 12 ? `${title.substring(0, 12)}...` : title}
                </h3>
                {subtitle && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-3 truncate dark:text-slate-400">
                        {subtitle}
                    </p>
                )}
                <div className="md:flex items-center justify-between pt-3 border-t dark:border-white/10 hidden">
                    <span className="text-xs sm:text-sm font-semibold text-violet-500 dark:text-violet-400" />
                    <div className="bg-violet-500/10 p-2 rounded-full dark:bg-violet-500/20">
                        <ArrowRight className="size-4 sm:size-4 text-violet-500 dark:text-violet-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </>
    );

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={className}>
                {content}
            </button>
        );
    }

    return (
        <Link href={href || "#"} className={className}>
            {content}
        </Link>
    );
}

function UserServices() {
    const { t } = useTranslation();
    const mobile = useDevice() === "mobile";
    const [paymentNotice, setPaymentNotice] = useState("");

    // Games passed down from the controller, and the shared user balance
    const { games, user } = usePage().props;
    const userBalance = Number(user?.balance ?? 0);

    // When set, we show that game's variants inline instead of the homepage
    const [selectedGame, setSelectedGame] = useState(null);
    const catAcc = accent(selectedGame?.category ?? "");

    const services = [
        {
            id: "tg-stars",
            title: "TELEGRAM STARS",
            category: "auto",
            color: "from-blue-400 to-cyan-500",
            image: TgStars,
            badge: t("services.badge_best"),
            href: "/user-telegram-stars",
        },
        {
            id: "tg-premium",
            title: "TELEGRAM PREMIUM",
            category: "auto",
            image: TgPremium,
            badge: t("services.badge_discount"),
            color: "bg-linear-to-tr from-[#5595FE] via-[#6B84FF] to-[#9E71F7]",
            href: "/user-telegram-premium",
        },
    ];

    // Every game opens inline on this page (no navigation) via onClick.
    // gamesForCategory('Game') only returns { name, image_url } — no
    // per-item category — so it's hardcoded here since this list is
    // always the "Game" category.
    const sortedGames = (games ?? []).slice().sort((a, b) => {
        const ai = PINNED_GAMES.indexOf(a.name);
        const bi = PINNED_GAMES.indexOf(b.name);
        if (ai === -1 && bi === -1) return 0; // keep backend order
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });

    const gameServices = sortedGames.map((game, i) => ({
        id: `game-${game.name}`,
        title: game.name,
        category: "Game",
        image: game.image_url,
        color: GAME_CARD_COLORS[i % GAME_CARD_COLORS.length],
        onClick: () =>
            setSelectedGame({
                name: game.name,
                category: "Game",
                image: game.image_url,
            }),
    }));

    const allServices = [...services, ...gameServices];

    const Desktopimages = [
        { img: MlbbDesktop, href: "/user-products-ml" },
        { img: PubgDesktop, href: "/user-products-uc" },
        { img: TelegramStars, href: "/user-telegram-stars" },
        { img: TelegramPremium, href: "/user-telegram-premium" },
    ];
    const Mobileimages = [MlbbMobile, PubgMobile];
    const images = mobile ? Mobileimages : Desktopimages;

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
        <div className="h-max px-4 py-10 md:py-6 bg-transparent dark:bg-[#0b0a12] pb-20">
            <style>{customPaginationStyles}</style>
            <Head title={t("services.page_title")} />

            <div className="container mx-auto">
                {selectedGame ? (
                    /* ── Inline game variants — no navigation away ────── */
                    <>
                        <GameVariants
                            category={selectedGame.category}
                            game={selectedGame.name}
                            gameImage={selectedGame.image}
                            accentColors={catAcc}
                            userBalance={userBalance}
                        />
                    </>
                ) : (
                    <>
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
                                className="rounded-xl overflow-hidden shadow-lg bg-amber-200 h-40 md:h-100"
                            >
                                {Desktopimages.map((img, index) => (
                                    <SwiperSlide key={index}>
                                        <Link href={img.href}>
                                            <div className="h-40 md:h-100 w-full">
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
                            <div className="flex items-center justify-between">
                                <h1 className="flex items-center gap-2 text-xl 2xl:text-3xl text-black dark:text-white">
                                    <Gamepad2 className="size-5 2xl:size-7 text-violet-500 dark:text-violet-400" />
                                    {t("services.title")}
                                </h1>
                            </div>
                            <div className="w-full grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 md:gap-8 px-0">
                                {allServices.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        {...service}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Payment methods */}
                        <div className="mt-10">
                            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">
                                To'lov usullari
                            </h2>
                            <PaymentCardsSwiper />
                        </div>

                        {/* Trust section */}
                        <div className="mt-16 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm p-8 sm:p-10 text-center">
                            {/* Icon */}
                            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 mb-4">
                                <Gamepad2 className="size-7 text-violet-600 dark:text-violet-400" />
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
                    </>
                )}
            </div>
        </div>
    );
}

export default UserServices;
