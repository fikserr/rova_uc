import MlbbIcon from "@images/mlbbIcon.webp";
import PubgIcon from "@images/pubgmIcon.webp";
import TgStarsIcon from "@images/tgStars.webp";
import { Link, usePage } from "@inertiajs/react";
import { ChevronDown, ChevronRight, Eye, Gift, Plus } from "lucide-react";

const QUICK_TOPUP = [
    {
        title: "PUBG Mobile",
        subtitle: "UC",
        icon: PubgIcon,
        href: "/user-products-uc",
    },
    {
        title: "Mobile Legends",
        subtitle: "Diamond",
        icon: MlbbIcon,
        href: "/user-products-ml",
    },
    {
        title: "Telegram Stars",
        subtitle: "Stars",
        icon: TgStarsIcon,
        href: "/user-telegram-stars",
    },
];

const NEWS = [
    {
        tag: "YANGI",
        tagCls: "bg-violet-600",
        title: "PUBG Mobile uchun yangi UC paketlari!",
        date: "20.05.2026",
    },
    {
        tag: "AKSIYA",
        tagCls: "bg-rose-600",
        title: "MLBB Diamond'ga chegirma!",
        date: "18.05.2026",
    },
    {
        tag: "YANGI",
        tagCls: "bg-violet-600",
        title: "Free Fire haftalik aksiyalari!",
        date: "15.05.2026",
    },
];

export default function UserRightPanel() {
    const { props } = usePage();
    const user = props?.auth?.user ?? null;
    const balance = Number(Math.floor(user?.balance ?? 0))
        .toLocaleString("fr-FR")
        .replace(/\s/g, " ");
    const displayName = user?.username || "Valler:User";

    return (
        <aside className="hidden xl:flex flex-col w-80 shrink-0 fixed inset-y-0 right-0 z-20 bg-[#0b0a12] border-l border-white/5 px-5 py-6 overflow-y-auto gap-5">
            {/* User pill */}
            <button className="flex items-center justify-between w-full gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 self-end">
                <div className="flex items-center gap-3">
                    <span className="size-8 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold">
                        {displayName.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-left leading-tight">
                        <p className="text-white text-xs font-semibold truncate max-w-32">
                            {displayName}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                            {balance} UZS
                        </p>
                    </span>
                </div>
                <ChevronDown className="size-3.5 text-slate-500 " />
            </button>

            {/* Balance card */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-xs">Mening balansim</p>
                    <Eye className="size-4 text-slate-500" />
                </div>
                <p className="text-white text-2xl font-extrabold mb-4">
                    {balance} uzs
                </p>
                <Link
                    href="/user-profile/user-balance"
                    className="flex items-center justify-center gap-1.5 w-full bg-violet-600 hover:bg-violet-500 transition-colors text-white text-sm font-semibold py-2.5 rounded-xl"
                >
                    <Plus className="size-4" />
                    Hisobni to'ldirish
                </Link>
            </div>

            {/* Quick topup */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-semibold">
                        Tezkor top-up
                    </p>
                    <Link
                        href="/all-services"
                        className="text-violet-400 text-xs font-medium"
                    >
                        Barchasi
                    </Link>
                </div>
                <div className="space-y-1">
                    {QUICK_TOPUP.map((item) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <img
                                src={item.icon}
                                alt={item.title}
                                className="size-9 rounded-lg object-cover"
                            />
                            <span className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">
                                    {item.title}
                                </p>
                                <p className="text-slate-500 text-[11px]">
                                    {item.subtitle}
                                </p>
                            </span>
                            <ChevronRight className="size-4 text-slate-600" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Referral CTA */}
            <div className="rounded-2xl bg-linear-to-br from-violet-700/50 to-fuchsia-700/20 border border-violet-500/20 p-4">
                <div className="flex items-start gap-3">
                    <span className="size-10 rounded-xl bg-violet-600/30 flex items-center justify-center shrink-0">
                        <Gift className="size-5 text-violet-300" />
                    </span>
                    <div>
                        <p className="text-white text-sm font-semibold">
                            Do'stlaringizni taklif qiling!
                        </p>
                        <p className="text-slate-400 text-xs mt-1 leading-snug">
                            Har bir do'stingiz uchun{" "}
                            <span className="text-amber-400 font-semibold">
                                10 000 UZS
                            </span>{" "}
                            gacha bonus oling!
                        </p>
                    </div>
                </div>
                <Link
                    href="/user-profile"
                    className="mt-3 block w-full text-center bg-violet-600 hover:bg-violet-500 transition-colors text-white text-xs font-semibold py-2 rounded-lg"
                >
                    Taklif qilish
                </Link>
            </div>

            {/* News */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-semibold">
                        Yangiliklar
                    </p>
                    <Link
                        href="/user-news"
                        className="text-violet-400 text-xs font-medium"
                    >
                        Barchasi
                    </Link>
                </div>
                <div className="space-y-3">
                    {NEWS.map((item) => (
                        <div
                            key={item.title}
                            className="flex items-start gap-2"
                        >
                            <span
                                className={`shrink-0 mt-0.5 text-[9px] font-bold text-white px-1.5 py-0.5 rounded ${item.tagCls}`}
                            >
                                {item.tag}
                            </span>
                            <div>
                                <p className="text-slate-200 text-xs leading-snug">
                                    {item.title}
                                </p>
                                <p className="text-slate-500 text-[10px] mt-0.5">
                                    {item.date}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
