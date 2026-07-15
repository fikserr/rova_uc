import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowLeft,
    CheckCircle,
    ChevronRight,
    LayoutDashboard,
    Loader2,
    LogOut,
    Plus,
    ShoppingBag,
    Sparkles,
    Tag,
    User,
    Wallet,
    Zap,
} from "lucide-react";
import { useState } from "react";

function Sidebar({ active }) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    const NAV = [
        { href: "/reseller",         icon: LayoutDashboard, label: "Dashboard" },
        { href: "/reseller",         icon: Tag,             label: "Narxlarim" },
        { href: "/reseller/shop",    icon: ShoppingBag,     label: "Do'kon" },
        { href: "/reseller/balance", icon: Wallet,          label: "Balans" },
        { href: "/reseller/profile", icon: User,            label: "Profil" },
    ];

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col bg-[#0f0f1a] border-r border-white/5 z-40">
            <div className="px-5 pt-7 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-violet-600 flex items-center justify-center">
                        <Sparkles className="size-4 text-white" />
                    </div>
                    <span className="font-black text-white tracking-wide text-lg">ROVA</span>
                    <span className="text-[10px] font-bold bg-violet-600/20 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-md ml-auto">PRO</span>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-0.5 mt-2">
                {NAV.map(n => (
                    <a
                        key={n.label}
                        href={n.href}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            active === n.label
                                ? "bg-violet-600/15 text-violet-300 border border-violet-500/20"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/3"
                        }`}
                    >
                        <n.icon className="size-4 shrink-0" />
                        {n.label}
                    </a>
                ))}
            </nav>

            <div className="px-3 pb-6">
                <form method="POST" action="/logout">
                    <input type="hidden" name="_token" value={csrfToken} />
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 transition-all">
                        <LogOut className="size-4" />
                        Chiqish
                    </button>
                </form>
            </div>
        </aside>
    );
}

function fmt(n) {
    return Number(n ?? 0).toLocaleString("fr-FR");
}

const CAT_COLORS = {
    Game:                     "text-violet-400",
    "Aplikasi Premium":       "text-blue-400",
    "E-Wallet":               "text-emerald-400",
    SMM:                      "text-pink-400",
    "Top Up & Digital Services": "text-amber-400",
    Voucher:                  "text-cyan-400",
};

export default function ResellerShop() {
    const { categories, balance } = usePage().props;

    const [selectedGame, setSelectedGame]     = useState(null);
    const [variants, setVariants]             = useState({});
    const [variantTypes, setVariantTypes]     = useState([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [target, setTarget]   = useState("");
    const [zoneId, setZoneId]   = useState("");
    const [validating, setValidating]   = useState(false);
    const [validated, setValidated]     = useState(false);
    const [playerName, setPlayerName]   = useState(null);
    const [validateError, setValidateError] = useState(null);
    const [ordering, setOrdering]   = useState(false);
    const [orderError, setOrderError] = useState(null);

    const needsZone =
        selectedVariant &&
        (selectedVariant.required_fields?.includes("zone_id") ||
            selectedVariant.game_name?.toLowerCase().includes("legend") ||
            selectedVariant.game_name?.toLowerCase().includes("mlbb"));

    const loadVariants = async (category, gameName) => {
        setLoadingVariants(true);
        setVariants({});
        setVariantTypes([]);
        setSelectedVariant(null);
        try {
            const res = await axios.get("/reseller/shop/variants", {
                params: { category, game: gameName },
            });
            setVariants(res.data.grouped);
            setVariantTypes(res.data.types);
        } catch {
            // silent
        } finally {
            setLoadingVariants(false);
        }
    };

    const selectGame = (cat, game) => {
        setSelectedGame({ category: cat, ...game });
        setSelectedVariant(null);
        setTarget("");
        setZoneId("");
        setValidated(false);
        setPlayerName(null);
        setValidateError(null);
        setOrderError(null);
        loadVariants(cat, game.name);
    };

    const selectVariant = (v) => {
        setSelectedVariant(v);
        setTarget("");
        setZoneId("");
        setValidated(false);
        setPlayerName(null);
        setValidateError(null);
        setOrderError(null);
    };

    const handleValidate = async () => {
        if (!target.trim()) return;
        setValidating(true);
        setValidateError(null);
        try {
            const res = await axios.post("/reseller/shop/validate", {
                product_id: selectedVariant.id,
                target: target.trim(),
                zone_id: needsZone ? zoneId.trim() || null : null,
            });
            setValidated(true);
            setPlayerName(res.data.name);
        } catch (e) {
            setValidateError(
                e.response?.data?.message || "Akkaunt topilmadi"
            );
            setValidated(false);
            setPlayerName(null);
        } finally {
            setValidating(false);
        }
    };

    const handleOrder = () => {
        if (!selectedVariant || !target.trim()) return;
        if (selectedVariant.has_validation && !validated) return;
        setOrdering(true);
        setOrderError(null);
        router.post(
            "/reseller/shop/order",
            {
                product_id: selectedVariant.id,
                target: target.trim(),
                zone_id: needsZone ? zoneId.trim() || null : null,
            },
            {
                onError: (e) => {
                    setOrderError(e.balance || e.api || "Xatolik yuz berdi");
                    setOrdering(false);
                },
                onSuccess: () => setOrdering(false),
            }
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <Head title="Reseller Do'kon" />

            <Sidebar active="Do'kon" />

            <div className="lg:ml-60 min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 h-14 flex items-center px-4 lg:px-8 gap-3">
                {selectedGame ? (
                    <button
                        onClick={() => {
                            setSelectedGame(null);
                            setSelectedVariant(null);
                        }}
                        className="size-8 flex items-center justify-center rounded-xl bg-white/6 hover:bg-white/10 transition-colors shrink-0"
                    >
                        <ArrowLeft className="size-4" />
                    </button>
                ) : (
                    <div className="flex items-center gap-2 shrink-0 lg:hidden">
                        <div className="size-7 rounded-lg bg-violet-600 flex items-center justify-center">
                            <Sparkles className="size-3.5" />
                        </div>
                        <span className="font-black text-sm tracking-wide">
                            ROVA{" "}
                            <span className="text-violet-400">PRO</span>
                        </span>
                    </div>
                )}

                <h1 className="text-sm font-bold flex-1 truncate">
                    {selectedGame ? selectedGame.name : "Do'kon"}
                </h1>

                <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5 shrink-0">
                    <Wallet className="size-3.5 text-violet-400" />
                    <span className="text-xs font-bold">{fmt(balance)} UZS</span>
                </div>
            </header>

            <main className="flex-1 px-4 lg:px-8 py-5 pb-28 lg:pb-8 max-w-2xl">
                {!selectedGame ? (
                    /* ── Game grid ── */
                    <div className="space-y-7">
                        {Object.entries(categories).map(([cat, games]) => (
                            <div key={cat}>
                                <p
                                    className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${
                                        CAT_COLORS[cat] ?? "text-slate-500"
                                    }`}
                                >
                                    {cat}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {games.map((game) => (
                                        <button
                                            key={game.name}
                                            onClick={() => selectGame(cat, game)}
                                            className="group relative overflow-hidden rounded-2xl bg-white/3 border border-white/5 hover:border-violet-500/30 hover:bg-white/5 transition-all text-left"
                                        >
                                            {game.image_url ? (
                                                <img
                                                    src={game.image_url}
                                                    alt={game.name}
                                                    className="w-full aspect-square object-cover opacity-75 group-hover:opacity-95 transition-opacity"
                                                />
                                            ) : (
                                                <div className="w-full aspect-square bg-violet-500/10 flex items-center justify-center">
                                                    <ShoppingBag className="size-8 text-violet-400/40" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                                                <p className="text-xs font-bold text-white leading-tight">
                                                    {game.name}
                                                </p>
                                            </div>
                                            <div className="absolute top-2 right-2 size-6 rounded-lg bg-black/40 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="size-3.5 text-white" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {Object.keys(categories).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="size-16 rounded-2xl bg-white/3 flex items-center justify-center mb-4">
                                    <ShoppingBag className="size-7 text-slate-600" />
                                </div>
                                <p className="text-slate-500 font-semibold">
                                    Reseller uchun mahsulot yo'q
                                </p>
                                <p className="text-slate-700 text-xs mt-1">
                                    Admin bilan bog'laning
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Variant list ── */
                    <div className="space-y-5">
                        {loadingVariants ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="size-8 text-violet-400 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {variantTypes.map((type) => (
                                    <div key={type}>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5">
                                            {type}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(variants[type] ?? []).map((v) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => selectVariant(v)}
                                                    className={`p-3 rounded-xl border text-left transition-all ${
                                                        selectedVariant?.id === v.id
                                                            ? "border-violet-500/60 bg-violet-600/15 shadow-lg shadow-violet-900/20"
                                                            : "border-white/5 bg-white/3 hover:bg-white/6 hover:border-white/10"
                                                    }`}
                                                >
                                                    <p className="text-xs font-semibold text-white leading-tight mb-1.5">
                                                        {v.name}
                                                    </p>
                                                    <p className="text-sm font-black text-violet-300">
                                                        {fmt(v.reseller_price_uzs)}
                                                        <span className="text-[10px] text-slate-600 font-normal ml-0.5">
                                                            UZS
                                                        </span>
                                                    </p>
                                                    {v.price_uzs &&
                                                        v.price_uzs !==
                                                            v.reseller_price_uzs && (
                                                            <p className="text-[10px] text-slate-700 line-through mt-0.5">
                                                                {fmt(v.price_uzs)} UZS
                                                            </p>
                                                        )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {variantTypes.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <p className="text-slate-500 text-sm">
                                            Bu o'yin uchun reseller narx belgilanmagan
                                        </p>
                                    </div>
                                )}

                                {/* Order form */}
                                {selectedVariant && (
                                    <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
                                        {/* Selected variant header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-violet-600/8">
                                            <p className="text-xs font-bold text-slate-200 truncate flex-1 mr-3">
                                                {selectedVariant.name}
                                            </p>
                                            <p className="text-sm font-black text-violet-300 shrink-0">
                                                {fmt(selectedVariant.reseller_price_uzs)} UZS
                                            </p>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            {/* Player ID */}
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                                    O'yinchi ID
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={target}
                                                        onChange={(e) => {
                                                            setTarget(e.target.value);
                                                            setValidated(false);
                                                            setPlayerName(null);
                                                            setValidateError(null);
                                                        }}
                                                        placeholder="ID kiriting..."
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-700 outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
                                                    />
                                                    {selectedVariant.has_validation && (
                                                        <button
                                                            onClick={handleValidate}
                                                            disabled={
                                                                validating ||
                                                                !target.trim()
                                                            }
                                                            className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                                                        >
                                                            {validating ? (
                                                                <Loader2 className="size-3.5 animate-spin" />
                                                            ) : (
                                                                <Zap className="size-3.5" />
                                                            )}
                                                            Tekshir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Zone ID */}
                                            {needsZone && (
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                                        Zone ID
                                                    </label>
                                                    <input
                                                        value={zoneId}
                                                        onChange={(e) =>
                                                            setZoneId(e.target.value)
                                                        }
                                                        placeholder="Zone kiriting..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-700 outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
                                                    />
                                                </div>
                                            )}

                                            {/* Validation result */}
                                            {validated && playerName && (
                                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                                                    <CheckCircle className="size-4 shrink-0" />
                                                    {playerName}
                                                </div>
                                            )}
                                            {validateError && (
                                                <p className="text-red-400 text-xs">
                                                    {validateError}
                                                </p>
                                            )}
                                            {orderError && (
                                                <p className="text-red-400 text-xs">
                                                    {orderError}
                                                </p>
                                            )}

                                            {/* Order button */}
                                            <button
                                                onClick={handleOrder}
                                                disabled={
                                                    ordering ||
                                                    !target.trim() ||
                                                    (selectedVariant.has_validation &&
                                                        !validated)
                                                }
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all"
                                            >
                                                {ordering ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <ShoppingBag className="size-4" />
                                                )}
                                                Buyurtma berish —{" "}
                                                {fmt(selectedVariant.reseller_price_uzs)}{" "}
                                                UZS
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
            </div>{/* end lg:ml-60 */}

            {/* Bottom nav (mobile only) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f1a]/95 backdrop-blur-xl border-t border-white/6 px-4 py-2 flex items-center justify-around">
                <a href="/reseller" className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 hover:text-slate-400 transition-colors">
                    <LayoutDashboard className="size-5" />
                    <span className="text-[10px] font-bold">Dashboard</span>
                </a>
                <a href="/reseller/shop" className="flex-1 flex flex-col items-center gap-1 py-1 text-violet-400">
                    <ShoppingBag className="size-5" />
                    <span className="text-[10px] font-bold">Do'kon</span>
                </a>
                <a href="/reseller/balance" className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 hover:text-slate-400 transition-colors">
                    <Plus className="size-5" />
                    <span className="text-[10px] font-bold">Balans</span>
                </a>
                <a href="/reseller/profile" className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 hover:text-slate-400 transition-colors">
                    <User className="size-5" />
                    <span className="text-[10px] font-bold">Profil</span>
                </a>
            </nav>
        </div>
    );
}
