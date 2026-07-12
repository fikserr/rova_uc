import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const CARDS = [
    {
        label: "UZCARD",
        holder: "VALLER GAMING",
        digits: "8600",
        gradient:
            "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #38bdf8 100%)",
        chip: "#facc15",
    },
    {
        label: "HUMO",
        holder: "VALLER GAMING",
        digits: "9860",
        gradient:
            "linear-gradient(135deg, #78350f 0%, #d97706 55%, #fbbf24 100%)",
        chip: "#fef3c7",
    },
    {
        label: "CLICK",
        holder: "VALLER GAMING",
        digits: "4471",
        gradient:
            "linear-gradient(135deg, #064e3b 0%, #059669 55%, #34d399 100%)",
        chip: "#fde68a",
    },
    {
        label: "Payme",
        holder: "VALLER GAMING",
        digits: "2290",
        gradient:
            "linear-gradient(135deg, #083344 0%, #0891b2 55%, #22d3ee 100%)",
        chip: "#fef9c3",
    },
    {
        label: "VISA",
        holder: "VALLER GAMING",
        digits: "1881",
        gradient:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%)",
        chip: "#e5e7eb",
    },
    {
        label: "Mastercard",
        holder: "VALLER GAMING",
        digits: "5533",
        gradient:
            "linear-gradient(135deg, #1f0a0a 0%, #7c2d12 55%, #ea580c 100%)",
        chip: "#fed7aa",
        dual: true,
    },
];

function BankCard({ card }) {
    return (
        <div
            className="relative w-full h-50 rounded-2xl p-4 sm:p-5 overflow-hidden shadow-lg"
            style={{ background: card.gradient }}
        >
            <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/10" />
            <div className="absolute -right-2 top-10 size-16 rounded-full bg-white/5" />

            <div className="relative h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div
                        className="w-8 h-6 rounded-md"
                        style={{ background: card.chip }}
                    />
                    {card.dual ? (
                        <div className="flex items-center">
                            <span className="size-6 rounded-full bg-red-500/90 -mr-2.5" />
                            <span className="size-6 rounded-full bg-amber-400/90" />
                        </div>
                    ) : (
                        <span className="text-white font-extrabold text-sm sm:text-base tracking-wide drop-shadow">
                            {card.label}
                        </span>
                    )}
                </div>

                <div>
                    <p className="text-white/90 font-mono text-sm sm:text-base tracking-[0.2em] mb-2">
                        •••• •••• •••• {card.digits}
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-white/70 text-[10px] sm:text-xs font-medium tracking-wide">
                            {card.holder}
                        </p>
                        {card.dual && (
                            <span className="text-white font-extrabold text-sm sm:text-base tracking-wide drop-shadow">
                                {card.label}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentCardsSwiper() {
    const onMobile = window.innerWidth < 640;
    const onTablet = window.innerWidth < 768;
    const onDesktop = window.innerWidth < 1024;
    return (
        <Swiper
            modules={[Autoplay]}
            slidesPerView={onMobile ? 1 : onTablet ? 2 : onDesktop ? 3 : 4}
            spaceBetween={14}
            loop
            autoplay={{ delay: 2200, disableOnInteraction: false }}
            className="overflow-hidden! h-50"
        >
            {CARDS.map((card) => (
                <SwiperSlide key={card.label}>
                    <BankCard card={card} />
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
