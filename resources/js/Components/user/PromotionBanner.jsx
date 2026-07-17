import { Tag, Timer } from "lucide-react";
import { useEffect, useState } from "react";

function useCountdown(endsAt) {
    const calc = () => {
        const diff = new Date(endsAt) - Date.now();
        if (diff <= 0) return null;
        return {
            h: Math.floor(diff / 3_600_000),
            m: Math.floor((diff % 3_600_000) / 60_000),
            s: Math.floor((diff % 60_000) / 1_000),
        };
    };

    const [rem, setRem] = useState(calc);

    useEffect(() => {
        const id = setInterval(() => setRem(calc()), 1000);
        return () => clearInterval(id);
    }, [endsAt]);

    return rem;
}

function SingleBanner({ promo }) {
    const rem = useCountdown(promo.ends_at);
    if (!rem) return null;

    const color = promo.banner_color ?? "#7c3aed";

    return (
        <div
            className="relative overflow-hidden rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`, border: `1px solid ${color}44` }}
        >
            {/* Left accent */}
            <div className="shrink-0 size-9 rounded-xl flex items-center justify-center text-white text-base font-bold" style={{ background: color }}>
                <Tag className="size-4" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold" style={{ color }}>
                        {promo.discount_percent}% chegirma
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        — {promo.title}
                    </span>
                </div>
                {promo.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {promo.description}
                    </p>
                )}
            </div>

            {/* Countdown */}
            <div className="shrink-0 flex items-center gap-1 text-xs font-mono font-bold rounded-lg px-2 py-1" style={{ color, background: `${color}22` }}>
                <Timer className="size-3" />
                {String(rem.h).padStart(2, "0")}:{String(rem.m).padStart(2, "0")}:{String(rem.s).padStart(2, "0")}
            </div>
        </div>
    );
}

export default function PromotionBanner({ promotions = [] }) {
    const active = promotions.filter((p) => new Date(p.ends_at) > new Date());
    if (active.length === 0) return null;

    return (
        <div className="space-y-2 mb-4">
            {active.map((p, i) => (
                <SingleBanner key={i} promo={p} />
            ))}
        </div>
    );
}
