import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    CheckCircle,
    ChevronRight,
    Loader2,
    ShoppingBag,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function fmt(n) {
    return Number(n ?? 0).toLocaleString("fr-FR");
}

const CAT_COLORS = {
    Game: "text-violet-400",
    "Aplikasi Premium": "text-blue-400",
    "E-Wallet": "text-emerald-400",
    SMM: "text-pink-400",
    "Top Up & Digital Services": "text-amber-400",
    Voucher: "text-cyan-400",
};

export default function ResellerShop() {
    const { categories, balance } = usePage().props;
    const { t } = useTranslation();

    const [selectedGame, setSelectedGame] = useState(null);
    const [variants, setVariants] = useState({});
    const [variantTypes, setVariantTypes] = useState([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [target, setTarget] = useState("");
    const [zoneId, setZoneId] = useState("");
    const [validating, setValidating] = useState(false);
    const [validated, setValidated] = useState(false);
    const [playerName, setPlayerName] = useState(null);
    const [validateError, setValidateError] = useState(null);
    const [ordering, setOrdering] = useState(false);
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
            setValidateError(e.response?.data?.message || "Akkaunt topilmadi");
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
            },
        );
    };

    return (
        <>
            <Head title="Reseller Do'kon" />
            <main className="flex-1 px-4 lg:px-8 py-5 pb-28 lg:pb-8 container">
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
                                            onClick={() =>
                                                selectGame(cat, game)
                                            }
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
                                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
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
                                    {t("reseller.noProduct")}
                                </p>
                                <p className="text-slate-700 text-xs mt-1">
                                    {t("reseller.betterCallAdmin")}
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
                                                    onClick={() =>
                                                        selectVariant(v)
                                                    }
                                                    className={`p-3 rounded-xl border text-left transition-all ${
                                                        selectedVariant?.id ===
                                                        v.id
                                                            ? "border-violet-500/60 bg-violet-600/15 shadow-lg shadow-violet-900/20"
                                                            : "border-white/5 bg-white/3 hover:bg-white/6 hover:border-white/10"
                                                    }`}
                                                >
                                                    <p className="text-xs font-semibold text-white leading-tight mb-1.5">
                                                        {v.name}
                                                    </p>
                                                    <p className="text-sm font-black text-violet-300">
                                                        {fmt(
                                                            v.reseller_price_uzs,
                                                        )}
                                                        <span className="text-[10px] text-slate-600 font-normal ml-0.5">
                                                            UZS
                                                        </span>
                                                    </p>
                                                    {v.price_uzs &&
                                                        v.price_uzs !==
                                                            v.reseller_price_uzs && (
                                                            <p className="text-[10px] text-slate-700 line-through mt-0.5">
                                                                {fmt(
                                                                    v.price_uzs,
                                                                )}{" "}
                                                                UZS
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
                                            Bu o'yin uchun reseller narx
                                            belgilanmagan
                                        </p>
                                    </div>
                                )}

                                {selectedVariant && (
                                    <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-violet-600/8">
                                            <p className="text-xs font-bold text-slate-200 truncate flex-1 mr-3">
                                                {selectedVariant.name}
                                            </p>
                                            <p className="text-sm font-black text-violet-300 shrink-0">
                                                {fmt(
                                                    selectedVariant.reseller_price_uzs,
                                                )}{" "}
                                                UZS
                                            </p>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                                    {t('shop.player_id_label')}
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={target}
                                                        onChange={(e) => {
                                                            setTarget(
                                                                e.target.value,
                                                            );
                                                            setValidated(false);
                                                            setPlayerName(null);
                                                            setValidateError(
                                                                null,
                                                            );
                                                        }}
                                                        placeholder={t('shop.player_id_placeholder')}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-700 outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
                                                    />
                                                    {selectedVariant.has_validation && (
                                                        <button
                                                            onClick={
                                                                handleValidate
                                                            }
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
                                                            {t('shop.check_btn')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {needsZone && (
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                                        {t('shop.server_id_label')}
                                                    </label>
                                                    <input
                                                        value={zoneId}
                                                        onChange={(e) =>
                                                            setZoneId(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder={t('shop.server_id_placeholder')}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-700 outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
                                                    />
                                                </div>
                                            )}

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
                                                {t('shop.order')} —{" "}
                                                {fmt(
                                                    selectedVariant.reseller_price_uzs,
                                                )}{" "}
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
        </>
    );
}
