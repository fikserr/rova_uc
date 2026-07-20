import axios from "axios";
import { CheckCircle, Loader2, ShoppingCart, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { imgFallback, imgProxy } from "../../Utils/ImgProxy";
import {
    productLabel,
    resolveProductImage,
    typeLabel,
} from "../../Utils/productOverrides";
/* ── Rang palitralari ─────────────────────────────────────────── */
export const CAT_COLORS = {
    Game: {
        gradient: "from-violet-500 to-purple-700",
        soft: "bg-violet-50 dark:bg-violet-500/10",
        text: "text-violet-600 dark:text-violet-400",
    },
    "Aplikasi Premium": {
        gradient: "from-blue-500 to-indigo-600",
        soft: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
    },
    "E-Wallet": {
        gradient: "from-emerald-500 to-teal-600",
        soft: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
    },
    SMM: {
        gradient: "from-pink-500 to-rose-600",
        soft: "bg-pink-50 dark:bg-pink-500/10",
        text: "text-pink-600 dark:text-pink-400",
    },
    "Top Up & Digital Services": {
        gradient: "from-amber-500 to-orange-600",
        soft: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
    },
    Tagihan: {
        gradient: "from-slate-500 to-gray-600",
        soft: "bg-slate-50 dark:bg-slate-500/10",
        text: "text-slate-600 dark:text-slate-400",
    },
    Voucher: {
        gradient: "from-cyan-500 to-sky-600",
        soft: "bg-cyan-50 dark:bg-cyan-500/10",
        text: "text-cyan-600 dark:text-cyan-400",
    },
};

export const GAME_COLORS = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-sky-600",
    "from-red-500 to-orange-600",
    "from-lime-500 to-green-600",
];

export function accent(cat) {
    return (
        CAT_COLORS[cat] ?? {
            gradient: "from-slate-500 to-gray-600",
            soft: "bg-slate-50 dark:bg-slate-500/10",
            text: "text-slate-600 dark:text-slate-400",
        }
    );
}

export function formatUzs(n) {
    return Number(n).toLocaleString("uz-UZ") + " UZS";
}

/* ── Mahsulot kartasi — endi modal ochmaydi, tanlanadi ──────────
   Selected card gets a glowing ring in the category's accent color.
   Double-click/double-tap opens the info modal instead of selecting. */
function VariantCard({
    product,
    game,
    accentColors,
    selected,
    onSelect,
    onInfo,
}) {
    return (
        <button
            onClick={() => onSelect(product)}
            onDoubleClick={(e) => {
                e.preventDefault();
                onInfo(product);
            }}
            className={`relative p-3 rounded-2xl border-2 text-left transition-all ${
                selected
                    ? `border-transparent bg-linear-to-br ${accentColors.gradient} shadow-lg scale-[1.02]`
                    : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600"
            }`}
        >
            <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700">
                    {resolveProductImage(game, product) && (
                        <img
                            src={resolveProductImage(game, product)}
                            alt={productLabel(game, product.name)}
                            className="w-full h-full object-cover"
                            onError={imgFallback}
                        />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p
                        className={`font-semibold text-sm leading-tight truncate ${
                            selected
                                ? "text-white"
                                : "text-slate-800 dark:text-white"
                        }`}
                    >
                        {productLabel(game, product.name)}
                    </p>
                    <p
                        className={`text-xs font-bold mt-0.5 ${
                            selected ? "text-white/90" : accentColors.text
                        }`}
                    >
                        {formatUzs(product.display_price ?? product.price_uzs)}
                        {product.is_reseller_price && (
                            <span className="ml-1 text-[10px] bg-emerald-500 text-white rounded px-1">
                                R
                            </span>
                        )}
                    </p>
                </div>
            </div>
            {selected && (
                <div className="absolute top-2 right-2 size-5 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle className={`size-4 ${accentColors.text}`} />
                </div>
            )}
        </button>
    );
}

/* ── Server/Type tablar + variantlar — asosiy eksport ───────────
   Both SekaliShop.jsx and UserServices.jsx render this once a game
   is picked; it fetches /shop/variants for that (category, game). */
export function GameVariants({
    category,
    game,
    gameImage,
    accentColors,
    userBalance,
}) {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState(null);

    // Account fields, now shown up-front instead of inside a modal
    const [target, setTarget] = useState("");
    const [zoneId, setZoneId] = useState("");
    const [verifiedName, setVerifiedName] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState("");

    // Selected product + order submission
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderError, setOrderError] = useState("");

    // Info modal — opens on double-click, shows product details without selecting it
    const [infoProduct, setInfoProduct] = useState(null);

    // Hide the sticky Buy bar whenever any text input/textarea is focused,
    // so it doesn't sit on top of the mobile keyboard.
    const [inputFocused, setInputFocused] = useState(false);

    useEffect(() => {
        const isTextField = (el) =>
            el &&
            (el.tagName === "INPUT" ||
                el.tagName === "TEXTAREA" ||
                el.isContentEditable);

        const onFocusIn = (e) => {
            if (isTextField(e.target)) setInputFocused(true);
        };
        const onFocusOut = (e) => {
            if (isTextField(e.target)) setInputFocused(false);
        };

        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("focusout", onFocusOut);
        return () => {
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("focusout", onFocusOut);
        };
    }, []);

    useState(() => {
        axios
            .get("/shop/variants", { params: { category, game } })
            .then((r) => {
                setData(r.data);
                setActiveType(r.data.types?.[0] ?? null);
            })
            .catch(() => setData({ grouped: {}, types: [] }))
            .finally(() => setLoading(false));
    });

    if (loading)
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-violet-500" />
            </div>
        );
    if (!data || !data.types?.length)
        return (
            <div className="text-center py-16 text-slate-400">
                {t("shop.not_found")}
            </div>
        );

    const { grouped, types } = data;
    const variants = grouped[activeType] ?? [];
    const allProducts = Object.values(grouped).flat();

    // Whether this game needs a Zone ID — derived from any product for this game.
    const needsZone = allProducts.some(
        (p) =>
            p.required_fields &&
            JSON.stringify(p.required_fields).toLowerCase().includes("zone"),
    );

    const canAfford = selectedProduct
        ? userBalance >=
          (selectedProduct.display_price ?? selectedProduct.price_uzs)
        : true;

    const handleVerify = async () => {
        if (!target.trim()) return;
        if (needsZone && !zoneId.trim()) return;
        setIsVerifying(true);
        setVerifyError("");
        setVerifiedName(null);
        try {
            const res = await axios.post("/shop/validate", {
                product_id: selectedProduct?.id ?? allProducts[0]?.id,
                target: target.trim(),
                zone_id: zoneId.trim() || null,
            });
            setVerifiedName(res.data.success ? (res.data.name ?? "✓") : null);
            if (!res.data.success) setVerifyError(t("shop.account_not_found"));
        } catch {
            setVerifyError(t("shop.account_not_found"));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOrder = async () => {
        if (!selectedProduct) return;
        if (!verifiedName) {
            setVerifyError(t("shop.verify_first"));
            return;
        }
        setIsSubmitting(true);
        setOrderError("");
        try {
            await axios.post("/shop/order", {
                product_id: selectedProduct.id,
                target: target.trim(),
                zone_id: zoneId.trim() || null,
            });
            window.location.href = "/user-purchases";
        } catch (e) {
            setOrderError(
                e?.response?.data?.errors?.balance?.[0] ||
                    e?.response?.data?.errors?.api?.[0] ||
                    t("shop.order_error"),
            );
            setIsSubmitting(false);
        }
    };

    const canBuy =
        !isSubmitting &&
        !!selectedProduct &&
        target.trim().length > 0 &&
        canAfford &&
        !!verifiedName;

    return (
        <div className="pb-28">
            {/* Hero banner — game art + title, like the reference screenshot */}
            {gameImage && (
                <div
                    className={`relative rounded-2xl overflow-hidden mb-5 h-28  `}
                >
                    <img
                        src={imgProxy(gameImage)}
                        alt={game}
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                        onError={imgFallback}
                    />
                    <div className={`absolute inset-0  opacity-80`} />
                    <div className="relative h-full flex items-center gap-4 px-5">
                        <div className="size-16 rounded-2xl overflow-hidden shrink-0 ring-2 ring-white/30 bg-white/10">
                            <img
                                src={imgProxy(gameImage)}
                                alt={game}
                                className="w-full h-full object-cover"
                                onError={imgFallback}
                            />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-white font-bold text-lg leading-tight truncate">
                                {game}
                            </h2>
                            <p className="text-white/80 text-xs mt-0.5">
                                {category}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Account fields */}
            <div className="mb-5 space-y-3">
                <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                        {t("shop.player_id_label")}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => {
                                setTarget(e.target.value);
                                setVerifiedName(null);
                                setVerifyError("");
                            }}
                            placeholder={t("shop.player_id_placeholder")}
                            className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                </div>

                {needsZone && (
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                            {t("shop.server_id_label")}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={zoneId}
                                onChange={(e) => {
                                    setZoneId(e.target.value);
                                    setVerifiedName(null);
                                    setVerifyError("");
                                }}
                                placeholder={t("shop.server_id_placeholder")}
                                className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <button
                                onClick={handleVerify}
                                disabled={
                                    isVerifying ||
                                    !target.trim() ||
                                    !zoneId.trim()
                                }
                                className={`shrink-0 px-4 rounded-xl font-semibold text-sm text-white flex items-center gap-1.5 disabled:opacity-50 bg-linear-to-r ${accentColors.gradient}`}
                            >
                                {isVerifying ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Zap className="size-4" />
                                )}
                                {t("shop.check_btn")}
                            </button>
                        </div>
                    </div>
                )}

                {!needsZone && (
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || !target.trim()}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-1.5 disabled:opacity-50 bg-linear-to-r ${accentColors.gradient}`}
                    >
                        {isVerifying ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Zap className="size-4" />
                        )}
                        {t("shop.check_btn")}
                    </button>
                )}

                {verifiedName && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
                        <CheckCircle className="size-4 shrink-0" />
                        <span className="font-semibold">{verifiedName}</span>
                    </div>
                )}
                {verifyError && (
                    <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                        {verifyError}
                    </p>
                )}
            </div>

            {/* Region / server type tabs */}
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                {t("shop.select_product")}
            </p>
            {types.length > 1 && (
                <div className="flex gap-2 flex-wrap mb-4">
                    {types.map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveType(type)}
                            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                                activeType === type
                                    ? `bg-linear-to-r ${accentColors.gradient} text-white shadow-md`
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300"
                            }`}
                        >
                            {typeLabel(game, type)}
                        </button>
                    ))}
                </div>
            )}

            {/* Product grid — tap to select, double-tap for info */}
            <div className="grid grid-cols-2 gap-3">
                {variants.map((p) => (
                    <VariantCard
                        key={p.id}
                        product={p}
                        game={game}
                        accentColors={accentColors}
                        selected={selectedProduct?.id === p.id}
                        onSelect={setSelectedProduct}
                        onInfo={setInfoProduct}
                    />
                ))}
            </div>

            {orderError && (
                <p className="mt-4 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                    {orderError}
                </p>
            )}
            {selectedProduct && !canAfford && (
                <p className="mt-4 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                    {t("shop.insufficient_balance_amount", {
                        balance: formatUzs(userBalance),
                    })}
                </p>
            )}

            {/* Sticky bottom buy bar — hidden while any input is focused
                (mobile keyboard open), so it doesn't overlap the bottom
                tab Bar or the keyboard itself. */}
            <div
                className={`fixed bottom-16 sm:bottom-4 left-0 right-0 px-4 z-30 transition-all duration-200 ${
                    inputFocused
                        ? "opacity-0 translate-y-full pointer-events-none"
                        : "opacity-100 translate-y-0"
                }`}
            >
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={handleOrder}
                        disabled={!canBuy}
                        className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-linear-to-r ${accentColors.gradient}`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <ShoppingCart className="size-5" />
                        )}
                        {t("others.buy")}
                    </button>
                </div>
            </div>

            {/* Info modal — opens on product double-click */}
            {infoProduct && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
                    onClick={() => setInfoProduct(null)}
                >
                    <div
                        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className={`relative h-24 bg-linear-to-br ${accentColors.gradient} flex items-end p-4`}
                        >
                            <button
                                onClick={() => setInfoProduct(null)}
                                className="absolute top-3 right-3 size-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                            <div className="size-14 rounded-xl overflow-hidden shrink-0 ring-2 ring-white/40 bg-white/10">
                                {resolveProductImage(game, infoProduct) && (
                                    <img
                                        src={resolveProductImage(
                                            game,
                                            infoProduct,
                                        )}
                                        alt={productLabel(
                                            game,
                                            infoProduct.name,
                                        )}
                                        className="w-full h-full object-cover"
                                        onError={imgFallback}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                                    {productLabel(game, infoProduct.name)}
                                </h3>
                                <p
                                    className={`text-sm font-bold mt-1 ${accentColors.text}`}
                                >
                                    {formatUzs(
                                        infoProduct.display_price ??
                                            infoProduct.price_uzs,
                                    )}
                                    {infoProduct.is_reseller_price && (
                                        <span className="ml-1.5 text-[10px] bg-emerald-500 text-white rounded px-1.5 py-0.5 align-middle">
                                            Reseller
                                        </span>
                                    )}
                                </p>
                            </div>

                            {infoProduct.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {infoProduct.description}
                                </p>
                            )}

                            {!infoProduct.is_reseller_price &&
                                infoProduct.price_uzs &&
                                infoProduct.display_price &&
                                infoProduct.price_uzs !==
                                    infoProduct.display_price && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 line-through">
                                        {formatUzs(infoProduct.price_uzs)}
                                    </p>
                                )}

                            <button
                                onClick={() => {
                                    setSelectedProduct(infoProduct);
                                    setInfoProduct(null);
                                }}
                                className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-1.5 bg-linear-to-r ${accentColors.gradient}`}
                            >
                                <CheckCircle className="size-4" />
                                {t("shop.select_product")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
