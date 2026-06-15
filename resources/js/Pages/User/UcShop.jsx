import PubgMobileBg from "@images/pubgMobileBg.webp";
import UcIcon from "@images/ucMain.webp";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowLeft,
    CheckCircle,
    ImageIcon,
    Loader2,
    Lock,
    Shield,
    XIcon,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import UserProductCard from "../../Components/ui/UserProductCard";

function UcShop() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("uc");

    // UC product purchase state
    const [selectedProduct, setSelectedProduct] = useState(null);
    // Bundle purchase state
    const [selectedBundle, setSelectedBundle] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("balance");
    const [pubgPlayerId, setPubgPlayerId] = useState("");
    const [pubgName, setPubgName] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState(null);
    const [verifyMessage, setVerifyMessage] = useState("");

    const {
        products,
        bundles = [],
        flash,
        user,
        lastPubgAccount,
    } = usePage().props;
    const userBalance = Number(user?.balance ?? 0);

    const activeItem = selectedProduct || selectedBundle;
    const activeItemType = selectedProduct ? "uc" : "bundle";
    const activeItemPrice = activeItem ? Number(activeItem.sell_price ?? 0) : 0;

    // Reset payment method when item or balance changes
    useEffect(() => {
        if (!activeItem) return;
        setPaymentMethod(userBalance >= activeItemPrice ? "balance" : "click");
    }, [activeItem, userBalance, activeItemPrice]);

    // Prefill PUBG ID when modal opens
    useEffect(() => {
        if (!activeItem) return;
        setPubgPlayerId(lastPubgAccount?.pubg_player_id ?? "");
        setPubgName(lastPubgAccount?.pubg_name ?? "");
        setVerifyStatus(null);
        setVerifyMessage("");
    }, [activeItem, lastPubgAccount]);

    const closeModal = () => {
        setSelectedProduct(null);
        setSelectedBundle(null);
        setPubgPlayerId("");
        setPubgName("");
        setVerifyStatus(null);
        setVerifyMessage("");
    };

    const handlePlayerIdChange = (e) => {
        setPubgPlayerId(e.target.value);
        setVerifyStatus(null);
        setVerifyMessage("");
        setPubgName("");
    };

    const handleVerify = async () => {
        if (!pubgPlayerId.trim()) {
            setVerifyStatus("error");
            setVerifyMessage(t("shop.verify_enter_id"));
            return;
        }
        setIsVerifying(true);
        setVerifyStatus(null);
        setVerifyMessage("");
        try {
            const response = await axios.post("/game/verify/pubg", {
                id: pubgPlayerId.trim(),
            });
            const username = response?.data?.username ?? null;
            if (username) {
                setPubgName(username);
                setVerifyStatus("success");
                setVerifyMessage(username);
            } else {
                setVerifyStatus("error");
                setVerifyMessage(t("shop.verify_not_found"));
            }
        } catch (err) {
            console.error(err);
            setVerifyStatus("error");
            setVerifyMessage(t("shop.verify_error"));
        } finally {
            setIsVerifying(false);
        }
    };

    const handlePurchase = async () => {
        if (!activeItem || isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (!pubgPlayerId.trim()) {
                alert(t("shop.pubg_id_required"));
                return;
            }

            const payload = {
                telegram_id: user?.id,
                payment_method: paymentMethod,
                pubg_player_id: pubgPlayerId.trim(),
                pubg_name: pubgName.trim(),
            };

            if (activeItemType === "uc") {
                payload.order_type = "uc";
                payload.product_id = selectedProduct.id;
            } else {
                payload.order_type = "bundle";
                payload.bundle_id = selectedBundle.id;
            }

            const response = await axios.post("/payment/create", payload);

            if (response?.data?.paid_with === "balance") {
                alert(t("shop.paid_with_balance"));
                closeModal();
                window.location.reload();
                return;
            }
            const paymentUrl = response?.data?.payment_url;
            if (paymentUrl) {
                closeModal();
                window.location.href = paymentUrl;
                return;
            }
            alert(t("shop.no_payment_url"));
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || t("shop.order_error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] px-4 py-6 pb-8 lg:pb-8 dark:bg-slate-900">
            <Head title={t("shop.uc_page_title")} />
            {flash?.success && (
                <div className="p-3 bg-green-100 text-green-700 rounded">
                    {flash.success}
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                <Link href="/user-services">
                    <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 hover:dark:text-slate-100 mb-6 transition-colors group">
                        <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">{t("common.back")}</span>
                    </button>
                </Link>

                {/* Hero banner */}
                <div className="bg-linear-to-r from-blue-500 to-blue-500 rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-transparent backdrop-blur-sm p-0 rounded-2xl text-4xl">
                            <img
                                src={PubgMobileBg}
                                className="w-26 h-26 rounded-xl"
                                alt=""
                            />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                                PUBG MOBILE
                            </h1>
                            <p className="text-white/90 text-sm sm:text-base">
                                {t("shop.uc_subtitle")}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="grid sm:grid-cols-3 gap-3 text-white text-sm">
                            <div className="flex items-center gap-2">
                                <Zap className="size-4" />
                                <span>{t("shop.fast_delivery")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="size-4" />
                                <span>{t("shop.secure")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="size-4" />
                                <span>{t("shop.support")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                    <button
                        onClick={() => setActiveTab("uc")}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === "uc"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                    >
                        AVTO 24/7
                    </button>
                    <button
                        onClick={() => setActiveTab("bundle")}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === "bundle"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                    >
                        To'plamlar
                    </button>
                </div>

                {/* UC Products Tab */}
                {activeTab === "uc" && (
                    <div className="mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            {t("shop.select_package")}
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...products]
                                .sort((a, b) => a.sell_price - b.sell_price)
                                .map((product) => (
                                    <UserProductCard
                                        product={{
                                            type: "uc",
                                            value: product.uc_amount,
                                            sell_price: product.sell_price,
                                            sell_currency:
                                                product.sell_currency,
                                            title: product.title,
                                        }}
                                        onClick={() =>
                                            setSelectedProduct(product)
                                        }
                                        key={product.id}
                                    />
                                ))}
                        </div>
                    </div>
                )}

                {/* Bundles Tab */}
                {activeTab === "bundle" && (
                    <div className="mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            To'plamlar
                        </h2>
                        {bundles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <span className="text-2xl">🎁</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Hozircha to'plamlar mavjud emas
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...bundles]
                                    .sort((a, b) => a.sell_price - b.sell_price)
                                    .map((bundle) => (
                                        <button
                                            key={bundle.id}
                                            onClick={() =>
                                                setSelectedBundle(bundle)
                                            }
                                            className="group relative w-full rounded-2xl text-left transition-all duration-300 overflow-hidden border bg-white dark:bg-slate-800/90 border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:shadow-blue-100 dark:hover:shadow-blue-900/30 cursor-pointer"
                                        >
                                            {/* Top accent bar */}
                                            <div className="h-1 w-full bg-linear-to-r from-blue-500 to-indigo-600" />

                                            {/* Image */}
                                            <div className="relative h-36 bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden">
                                                {bundle.image_url ? (
                                                    <img
                                                        src={bundle.image_url}
                                                        alt={bundle.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <ImageIcon className="size-10 text-slate-300 dark:text-slate-600" />
                                                )}
                                            </div>

                                            <div className="p-4">
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1 truncate">
                                                    {bundle.title}
                                                </h3>
                                                <div className="flex flex-col items-start gap-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 px-3 py-2.5">
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                        {t("others.price")}
                                                    </p>
                                                    <p className="text-base font-bold text-blue-600 dark:text-blue-400 leading-none">
                                                        {Number(
                                                            Math.floor(
                                                                bundle.sell_price,
                                                            ),
                                                        ).toLocaleString(
                                                            "fr-FR",
                                                        )}
                                                        <span className="text-xs font-bold ml-1">
                                                            UZS
                                                        </span>
                                                    </p>
                                                    <div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-blue-500 text-white text-xs font-bold shadow-sm transition-all group-hover:scale-105">
                                                        <span>
                                                            {t("others.buy")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Purchase Modal — shared for both UC and Bundle */}
                {activeItem && (
                    <div
                        className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 px-4"
                        onClick={(e) =>
                            e.target === e.currentTarget && closeModal()
                        }
                    >
                        <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 flex flex-col gap-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                                        {t("shop.order_summary_label")}
                                    </p>
                                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                        {t("shop.order_summary")}
                                    </h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                >
                                    <XIcon size={15} />
                                </button>
                            </div>

                            {/* Product summary row */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex flex-col gap-2.5 dark:border-slate-700 dark:bg-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {t("shop.product")}
                                    </span>
                                    {activeItemType === "uc" ? (
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                                            <img
                                                src={UcIcon}
                                                alt="UC"
                                                className="w-5 h-5"
                                            />
                                            {selectedProduct.uc_amount} UC
                                            {selectedProduct.bonus && (
                                                <span className="rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-300">
                                                    +{selectedProduct.bonus}{" "}
                                                    bonus
                                                </span>
                                            )}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                                            🎁 {selectedBundle.title}
                                        </span>
                                    )}
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {t("shop.for_whom")}
                                    </span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {user.username}
                                    </span>
                                </div>
                            </div>

                            {/* PUBG ID field */}
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="mb-1.5 block text-xs text-slate-500 dark:text-slate-400">
                                        {t("shop.pubg_player_id")}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={pubgPlayerId}
                                            onChange={handlePlayerIdChange}
                                            placeholder={t(
                                                "shop.pubg_id_placeholder",
                                            )}
                                            className={`h-10 flex-1 min-w-0 rounded-lg border px-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition
                                                ${
                                                    verifyStatus === "success"
                                                        ? "border-emerald-400 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-100 dark:border-emerald-600 dark:bg-emerald-900/10"
                                                        : verifyStatus ===
                                                            "error"
                                                          ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-100 dark:border-red-600 dark:bg-red-900/10"
                                                          : "border-slate-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
                                                }
                                                dark:text-slate-100 dark:placeholder-slate-500`}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerify}
                                            disabled={
                                                isVerifying ||
                                                !pubgPlayerId.trim()
                                            }
                                            className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 flex items-center gap-1.5 shrink-0"
                                        >
                                            {isVerifying ? (
                                                <Loader2
                                                    size={13}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <CheckCircle size={13} />
                                            )}
                                            {isVerifying
                                                ? "..."
                                                : t("shop.verify_btn")}
                                        </button>
                                    </div>
                                    {verifyStatus === "success" && (
                                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                                            <CheckCircle size={12} />
                                            <span>
                                                {t("shop.verify_found")}:{" "}
                                                <strong>{verifyMessage}</strong>
                                            </span>
                                        </div>
                                    )}
                                    {verifyStatus === "error" && (
                                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                                            {verifyMessage}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        {t("shop.pubg_nickname_optional")}
                                        {verifyStatus === "success" && (
                                            <span className="ml-auto flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
                                                <Lock size={10} />
                                                <span>
                                                    {t("shop.auto_filled")}
                                                </span>
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        value={pubgName}
                                        readOnly
                                        placeholder={t(
                                            "shop.nickname_auto_placeholder",
                                        )}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 placeholder-slate-400 outline-none cursor-not-allowed dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-400 dark:placeholder-slate-500"
                                    />
                                </div>
                            </div>

                            {/* Balance row */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex flex-col gap-2.5 dark:border-slate-700 dark:bg-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {t("shop.balance_label")}
                                    </span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {Number(userBalance).toLocaleString(
                                            "fr-FR",
                                        )}{" "}
                                        UZS
                                    </span>
                                </div>
                                {userBalance < activeItemPrice && (
                                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                        {t("shop.insufficient_balance_topup")}
                                    </p>
                                )}
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between px-1">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {t("shop.total")}
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-medium text-slate-900 dark:text-slate-100">
                                        {Number(
                                            Math.floor(activeItemPrice),
                                        ).toLocaleString("fr-FR", {
                                            maximumFractionDigits: 4,
                                        })}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {activeItem.sell_currency}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={isSubmitting}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-[15px] font-medium text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                        {t("shop.submitting")}
                                    </>
                                ) : (
                                    t("shop.buy_now")
                                )}
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 dark:text-white">
                        <Shield className="size-5 text-blue-600" />
                        {t("shop.important_info")}
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li>• {t("shop.info_delivery")}</li>
                        <li>• {t("shop.info_secure")}</li>
                        <li>• {t("shop.info_support")}</li>
                        <li>• {t("shop.info_verify_warning")}</li>
                        <li>• {t("shop.info_disclaimer")}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default UcShop;
