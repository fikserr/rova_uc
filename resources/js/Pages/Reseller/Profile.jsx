import { Head, router, usePage } from "@inertiajs/react";
import {
    BarChart3,
    Calendar,
    Plus,
    TrendingDown,
    User,
    Wallet,
} from "lucide-react";

function fmt(n) {
    return Number(n ?? 0).toLocaleString("fr-FR");
}

export default function ResellerProfile() {
    const { user, balance, stats } = usePage().props;

    const handleLogout = () => router.post("/logout");

    const createdDate = new Date(user.created_at);
    const formattedDate = `${String(createdDate.getDate()).padStart(2, "0")}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${createdDate.getFullYear()}`;
    const displayName = user.username || `#${user.id}`;

    return (
        <>
            <Head title="Profil" />

            <div className="px-4 lg:px-8 py-5 max-w-2xl space-y-4">

                {/* Profile card */}
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-600/20 via-violet-800/10 to-transparent border border-violet-500/15 p-5">
                    <div className="absolute -right-6 -top-6 size-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />
                    <div className="relative flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <User className="size-7 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-white text-lg truncate">{displayName}</p>
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                                <Calendar className="size-3.5" />
                                <span>A'zo bo'lgan: {formattedDate}</span>
                            </div>
                            <span className="inline-block mt-1.5 text-[10px] font-bold bg-violet-600/20 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-md">
                                RESELLER
                            </span>
                        </div>
                    </div>
                </div>

                {/* Balance */}
                <div className="rounded-2xl bg-white/3 border border-white/6 p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Joriy balans</p>
                        <p className="text-2xl font-black text-white mt-0.5">
                            {fmt(balance)}
                            <span className="text-sm text-slate-500 font-semibold ml-1.5">UZS</span>
                        </p>
                    </div>
                    <a
                        href="/reseller/balance"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all"
                    >
                        <Plus className="size-3.5" /> To'ldirish
                    </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2.5">
                    {[
                        { label: "Buyurtmalar", value: stats.total_orders,     suffix: "",     color: "text-slate-300",   icon: BarChart3 },
                        { label: "Sarflandi",   value: fmt(stats.total_spent), suffix: " UZS", color: "text-blue-400",    icon: Wallet },
                        { label: "Tejaldi",     value: fmt(stats.total_saved), suffix: " UZS", color: "text-emerald-400", icon: TrendingDown },
                    ].map((s) => (
                        <div key={s.label} className="bg-white/3 border border-white/5 rounded-xl p-3">
                            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">{s.label}</p>
                            <p className={`text-sm font-black mt-1 leading-tight ${s.color}`}>
                                {s.value}
                                {s.suffix && <span className="text-[9px] font-semibold text-slate-600 ml-0.5">{s.suffix}</span>}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 hover:bg-rose-500/10 hover:border-rose-500/25 transition-all text-left"
                >
                    <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
                        <svg className="size-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-rose-400">Chiqish</p>
                        <p className="text-xs text-slate-600">Hisobdan chiqish</p>
                    </div>
                </button>
            </div>
        </>
    );
}
