import PubgMobileBg from "@images/pubgMobileBg.webp";
import UcIcon from "@images/ucMain.webp";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowLeft,
    CheckCircle,
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
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("balance");
    const [pubgPlayerId, setPubgPlayerId] = useState("");
    const [pubgName, setPubgName] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState(null);
    const [verifyMessage, setVerifyMessage] = useState("");

    const { products, flash, user, lastPubgAccount } = usePage().props;
    const userBalance = Number(user?.balance ?? 0);

    const service = {
        title: "PUBG MOBILE",
        subtitle: t("shop.uc_subtitle"),
        image: PubgMobileBg,
        color: "from-blue-500 to-blue-500",
        products: products,
    };

    useEffect(() => {
        if (!selectedProduct) return;
        const enough = userBalance >= Number(selectedProduct.sell_price ?? 0);
        setPaymentMethod(enough ? "balance" : "click");
    }, [selectedProduct, userBalance]);

    useEffect(() => {
        if (!selectedProduct) return;
        setPubgPlayerId(lastPubgAccount?.pubg_player_id ?? "");
        setPubgName(lastPubgAccount?.pubg_name ?? "");
        setVerifyStatus(null);
        setVerifyMessage("");
    }, [selectedProduct, lastPubgAccount]);

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
            const response = await fetch(
                `https://check-id-game1.p.rapidapi.com/api/game/pubg-mobile-global-vc?id=${pubgPlayerId.trim()}`,
                {
                    method: "GET",
                    headers: {
                        "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
                        "x-rapidapi-host": "check-id-game1.p.rapidapi.com",
                        "Content-Type": "application/json",
                    },
                },
            );
            const data = await response.json();
            const username =
                data?.data?.username ||
                data?.data?.name ||
                data?.data?.nickname ||
                data?.data?.playerName ||
                data?.name ||
                data?.username ||
                data?.nickname ||
                null;
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
        if (!selectedProduct || isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (!pubgPlayerId.trim()) {
                alert(t("shop.pubg_id_required"));
                return;
            }
            const response = await axios.post("/payment/create", {
                telegram_id: user?.id,
                payment_method: paymentMethod,
                order_type: "uc",
                product_id: selectedProduct.id,
                pubg_player_id: pubgPlayerId.trim(),
                pubg_name: pubgName.trim(),
            });
            if (response?.data?.paid_with === "balance") {
                alert(t("shop.paid_with_balance"));
                setSelectedProduct(null);
                setPubgPlayerId("");
                setPubgName("");
                setVerifyStatus(null);
                setVerifyMessage("");
                window.location.reload();
                return;
            }
            const paymentUrl = response?.data?.payment_url;
            if (paymentUrl) {
                setPubgPlayerId("");
                setPubgName("");
                setVerifyStatus(null);
                setVerifyMessage("");
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

                <div
                    className={`bg-linear-to-r ${service.color} rounded-3xl p-6 sm:p-8 mb-8 shadow-xl`}
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-transparent backdrop-blur-sm p-0 rounded-2xl text-4xl">
                            <img
                                src={service.image}
                                className="w-26 h-26 rounded-xl"
                                alt=""
                            />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                                {service.title}
                            </h1>
                            <p className="text-white/90 text-sm sm:text-base">
                                {service.subtitle}
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

                <div className="mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                        {t("shop.select_package")}
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {service.products.map((product) => (
                            <UserProductCard
                                product={{
                                    type: "uc",
                                    value: product.uc_amount,
                                    sell_price: product.sell_price,
                                    sell_currency: product.sell_currency,
                                    title: product.title,
                                }}
                                onClick={setSelectedProduct.bind(null, product)}
                                key={product.id}
                            />
                        ))}
                    </div>
                </div>

                {selectedProduct && (
                    <div
                        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4"
                        onClick={(e) =>
                            e.target === e.currentTarget &&
                            setSelectedProduct(null)
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
                                    onClick={() => setSelectedProduct(null)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                >
                                    <XIcon size={15} />
                                </button>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex flex-col gap-2.5 dark:border-slate-700 dark:bg-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {t("shop.product")}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                                        <img
                                            src={UcIcon}
                                            alt="UC"
                                            className="w-5 h-5"
                                        />
                                        {selectedProduct.uc_amount} UC
                                        {selectedProduct.bonus && (
                                            <span className="rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-300">
                                                +{selectedProduct.bonus} bonus
                                            </span>
                                        )}
                                    </span>
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
                                        onChange={(e) =>
                                            setPubgName(e.target.value)
                                        }
                                        readOnly
                                        placeholder={t(
                                            "shop.nickname_auto_placeholder",
                                        )}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 placeholder-slate-400 outline-none cursor-not-allowed dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-400 dark:placeholder-slate-500"
                                    />
                                </div>
                            </div>

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
                                {userBalance >=
                                Number(selectedProduct.sell_price ?? 0) ? (
                                    <div className="flex gap-2"></div>
                                ) : (
                                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                        {t("shop.insufficient_balance_topup")}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {t("shop.total")}
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-medium text-slate-900 dark:text-slate-100">
                                        {Number(
                                            Math.floor(
                                                selectedProduct.sell_price,
                                            ),
                                        ).toLocaleString("fr-FR", {
                                            maximumFractionDigits: 4,
                                        })}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {selectedProduct.sell_currency}
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
