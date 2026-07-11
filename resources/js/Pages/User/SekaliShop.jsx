import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowLeft, CheckCircle, Gamepad2, Loader2,
    ShoppingCart, X, Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import UserLayout from "../Layout/UserLayout";

/* ── Rang palitralari ─────────────────────────────────────────── */
const CAT_COLORS = {
    "Game":                      { gradient: "from-violet-500 to-purple-700", soft: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
    "Aplikasi Premium":          { gradient: "from-blue-500 to-indigo-600",   soft: "bg-blue-50 dark:bg-blue-500/10",    text: "text-blue-600 dark:text-blue-400" },
    "E-Wallet":                  { gradient: "from-emerald-500 to-teal-600",  soft: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    "SMM":                       { gradient: "from-pink-500 to-rose-600",     soft: "bg-pink-50 dark:bg-pink-500/10",    text: "text-pink-600 dark:text-pink-400" },
    "Top Up & Digital Services": { gradient: "from-amber-500 to-orange-600",  soft: "bg-amber-50 dark:bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400" },
    "Tagihan":                   { gradient: "from-slate-500 to-gray-600",    soft: "bg-slate-50 dark:bg-slate-500/10",  text: "text-slate-600 dark:text-slate-400" },
    "Voucher":                   { gradient: "from-cyan-500 to-sky-600",      soft: "bg-cyan-50 dark:bg-cyan-500/10",    text: "text-cyan-600 dark:text-cyan-400" },
};

const GAME_COLORS = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-sky-600",
    "from-red-500 to-orange-600",
    "from-lime-500 to-green-600",
];

function accent(cat) {
    return CAT_COLORS[cat] ?? { gradient: "from-slate-500 to-gray-600", soft: "bg-slate-50 dark:bg-slate-500/10", text: "text-slate-600 dark:text-slate-400" };
}

function formatUzs(n) {
    return Number(n).toLocaleString("uz-UZ") + " UZS";
}

/* ── Modal ────────────────────────────────────────────────────── */
function OrderModal({ product, gameName, accentColors, userBalance, onClose }) {
    const { t } = useTranslation();
    const [target, setTarget]             = useState("");
    const [zoneId, setZoneId]             = useState("");
    const [verifiedName, setVerifiedName] = useState(null);
    const [isVerifying, setIsVerifying]   = useState(false);
    const [verifyError, setVerifyError]   = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderError, setOrderError]     = useState("");

    const canAfford = userBalance >= product.price_uzs;
    const needsZone = product.required_fields &&
        JSON.stringify(product.required_fields).toLowerCase().includes("zone");

    const handleVerify = async () => {
        if (!target.trim()) return;
        setIsVerifying(true); setVerifyError(""); setVerifiedName(null);
        try {
            const res = await axios.post("/shop/validate", {
                product_id: product.id, target: target.trim(),
                zone_id: zoneId.trim() || null,
            });
            setVerifiedName(res.data.success ? (res.data.name ?? "✓") : null);
            if (!res.data.success) setVerifyError("Akkaunt topilmadi");
        } catch {
            setVerifyError("Akkaunt topilmadi");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOrder = async () => {
        if (product.has_validation && !verifiedName) { setVerifyError("Avval tasdiqlang"); return; }
        setIsSubmitting(true); setOrderError("");
        try {
            await axios.post("/shop/order", {
                product_id: product.id, target: target.trim(),
                zone_id: zoneId.trim() || null,
            });
            window.location.href = "/user-purchases";
        } catch (e) {
            setOrderError(
                e?.response?.data?.errors?.balance?.[0] ||
                e?.response?.data?.errors?.api?.[0] || "Xatolik yuz berdi"
            );
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
                <div className={`h-1.5 bg-linear-to-r ${accentColors.gradient}`} />
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">{gameName}</p>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{product.name}</h3>
                            {product.product_type && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${accentColors.soft} ${accentColors.text}`}>
                                    {product.product_type}
                                </span>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Price */}
                    <div className={`rounded-2xl ${accentColors.soft} px-4 py-3 mb-4`}>
                        <p className="text-xs text-slate-400 mb-0.5">Narx</p>
                        <p className={`text-2xl font-bold ${accentColors.text}`}>{formatUzs(product.price_uzs)}</p>
                        {!canAfford && (
                            <p className="text-xs text-red-500 mt-1">
                                Balansingiz yetarli emas ({formatUzs(userBalance)})
                            </p>
                        )}
                    </div>

                    {/* Target */}
                    <div className="mb-3">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                            Game ID / Username
                        </label>
                        <input type="text" value={target}
                            onChange={e => { setTarget(e.target.value); setVerifiedName(null); setVerifyError(""); }}
                            placeholder="Masalan: 123456789"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    {needsZone && (
                        <div className="mb-3">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                                Server / Zone ID
                            </label>
                            <input type="text" value={zoneId}
                                onChange={e => setZoneId(e.target.value)}
                                placeholder="Zone ID"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                    )}

                    {product.has_validation && (
                        <button onClick={handleVerify} disabled={isVerifying || !target.trim()}
                            className="w-full mb-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                            {isVerifying ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
                            Akkauntni tasdiqlash
                        </button>
                    )}

                    {verifiedName && (
                        <div className="mb-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
                            <CheckCircle className="size-4 shrink-0" />
                            <span className="font-semibold">{verifiedName}</span>
                        </div>
                    )}
                    {(verifyError || orderError) && (
                        <p className="mb-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                            {verifyError || orderError}
                        </p>
                    )}

                    <button
                        onClick={handleOrder}
                        disabled={isSubmitting || !target.trim() || !canAfford || (product.has_validation && !verifiedName)}
                        className={`w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r ${accentColors.gradient} shadow-md hover:shadow-lg hover:scale-[1.01]`}
                    >
                        {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <ShoppingCart className="size-5" />}
                        {isSubmitting ? "Buyurtma berilmoqda..." : "Buyurtma berish"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Variant kartasi ─────────────────────────────────────────── */
function VariantCard({ product, accentColors, onClick }) {
    return (
        <button onClick={() => onClick(product)}
            className="p-3.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group">
            <div className={`h-0.5 rounded-full bg-linear-to-r ${accentColors.gradient} mb-2.5`} />
            <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight mb-2">{product.name}</p>
            <p className={`text-sm font-bold ${accentColors.text}`}>{formatUzs(product.price_uzs)}</p>
        </button>
    );
}

/* ── Server/Type tablar ────────────────────────────────────────  */
function GameVariants({ category, game, accentColors, userBalance }) {
    const [data, setData]           = useState(null);
    const [loading, setLoading]     = useState(true);
    const [activeType, setActiveType] = useState(null);
    const [modal, setModal]         = useState(null);

    useState(() => {
        axios.get('/shop/variants', { params: { category, game } })
            .then(r => {
                setData(r.data);
                setActiveType(r.data.types?.[0] ?? null);
            })
            .catch(() => setData({ grouped: {}, types: [] }))
            .finally(() => setLoading(false));
    });

    if (loading) return (
        <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-violet-500" />
        </div>
    );
    if (!data || !data.types?.length) return (
        <div className="text-center py-16 text-slate-400">Mahsulot topilmadi</div>
    );

    const { grouped, types } = data;
    const variants = grouped[activeType] ?? [];

    return (
        <>
            {/* Server tabs — faqat 1 dan ko'p bo'lsa ko'rsat */}
            {types.length > 1 && (
                <div className="flex gap-2 flex-wrap mb-5">
                    {types.map(type => (
                        <button key={type}
                            onClick={() => setActiveType(type)}
                            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                                activeType === type
                                    ? `bg-linear-to-r ${accentColors.gradient} text-white shadow-md`
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}

            {/* Variant grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {variants.map(p => (
                    <VariantCard key={p.id} product={p} accentColors={accentColors} onClick={setModal} />
                ))}
            </div>

            {modal && (
                <OrderModal
                    product={modal}
                    gameName={game}
                    accentColors={accentColors}
                    userBalance={userBalance}
                    onClose={() => setModal(null)}
                />
            )}
        </>
    );
}

/* ── Asosiy komponent ────────────────────────────────────────── */
export default function SekaliShop() {
    const { categories, user } = usePage().props;
    const userBalance = Number(user?.balance ?? 0);

    // Navigation state
    const [selectedCat, setSelectedCat] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);

    const catList  = categories ? Object.keys(categories) : [];
    const gameList = selectedCat ? (categories?.[selectedCat] ?? []) : [];
    const catAcc   = accent(selectedCat ?? "");

    const goBack = () => {
        if (selectedGame) { setSelectedGame(null); return; }
        setSelectedCat(null);
    };

    return (
        <UserLayout>
            <Head title="Do'kon" />
            <div className="max-w-2xl mx-auto px-3 pb-28">

                {/* Header */}
                <div className="flex items-center gap-3 py-4 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 -mx-3 px-3">
                    {(selectedCat) && (
                        <button onClick={goBack}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                            <ArrowLeft className="size-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                            {selectedGame ?? selectedCat ?? "Do'kon"}
                        </h1>
                        <p className="text-xs text-slate-400 truncate">
                            {selectedGame
                                ? (selectedCat ?? "")
                                : selectedCat
                                    ? `${gameList.length} ta o'yin/xizmat`
                                    : "O'yin va raqamli mahsulotlar"}
                        </p>
                    </div>
                </div>

                {/* Kategoriyalar */}
                {!selectedCat && (
                    <div className="grid grid-cols-1 gap-3 mt-2">
                        {catList.map((cat, i) => {
                            const acc = accent(cat);
                            const count = (categories[cat] ?? []).length;
                            return (
                                <button key={cat} onClick={() => setSelectedCat(cat)}
                                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                                    <div className={`size-12 rounded-2xl bg-linear-to-br ${acc.gradient} flex items-center justify-center shrink-0`}>
                                        <Gamepad2 className="size-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 dark:text-white">{cat}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{count} ta</p>
                                    </div>
                                    <ArrowLeft className="size-5 text-slate-300 dark:text-slate-600 rotate-180" />
                                </button>
                            );
                        })}
                        {catList.length === 0 && (
                            <div className="text-center py-16 text-slate-400">
                                <Gamepad2 className="size-12 mx-auto mb-3 opacity-30" />
                                <p>Mahsulotlar yo'q. Sync qiling.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* O'yinlar kategoriya ichida */}
                {selectedCat && !selectedGame && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {gameList.map((game, i) => {
                            const grad = GAME_COLORS[i % GAME_COLORS.length];
                            return (
                                <button key={game} onClick={() => setSelectedGame(game)}
                                    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center">
                                    <div className={`size-12 rounded-2xl bg-linear-to-br ${grad} flex items-center justify-center`}>
                                        <Gamepad2 className="size-6 text-white" />
                                    </div>
                                    <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{game}</p>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Server tabs + Variantlar */}
                {selectedCat && selectedGame && (
                    <div className="mt-2">
                        <GameVariants
                            category={selectedCat}
                            game={selectedGame}
                            accentColors={catAcc}
                            userBalance={userBalance}
                        />
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
