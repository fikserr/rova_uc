import ClickLogo from "@images/click_logo.png";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    CheckCircle,
    Clock,
    Copy,
    CreditCard,
    Receipt,
    Upload,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
function UserBalance() {
    const { t } = useTranslation();
    const { user } = usePage().props;

    const STATUS_LABEL = {
        pending: {
            text: t("balance.status.pending"),
            cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        },
        approved: {
            text: t("balance.status.approved"),
            cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        },
        rejected: {
            text: t("balance.status.rejected"),
            cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
        },
    };

    const paymentMethods = [
        {
            id: "click",
            label: t("balance.method_click"),
            icon: "🇺🇿",
            iconComponent: ClickLogo,
            desc: t("balance.method_click_desc"),
            disabled: true,
        },
        {
            id: "manual",
            label: t("balance.method_manual"),
            icon: "🧾",
            desc: t("balance.method_manual_desc"),
        },
    ];

    const cardGradients = [
        "from-indigo-500 via-blue-600 to-violet-600",
        "from-rose-500 via-pink-600 to-red-500",
        "from-emerald-500 via-teal-500 to-cyan-600",
        "from-amber-500 via-orange-500 to-red-500",
        "from-purple-500 via-violet-600 to-indigo-600",
        "from-cyan-500 via-sky-500 to-blue-600",
    ];

    // ── Click payment ─────────────────────────────────────────────
    const [selectedMethod, setSelectedMethod] = useState("manual");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    // ── Manual payment ────────────────────────────────────────────
    const [checkAmount, setCheckAmount] = useState("");
    const [receiptFile, setReceiptFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [checkLoading, setCheckLoading] = useState(false);
    const [checkSuccess, setCheckSuccess] = useState(false);
    const [myRequests, setMyRequests] = useState([]);
    const [paymentCards, setPaymentCards] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    const fileInputRef = useRef(null);

    const quickAmounts = [10000, 30000, 50000, 100000, 200000, 500000];

    useEffect(() => {
        axios
            .get("/manual-topup/my")
            .then((res) => setMyRequests(res.data))
            .catch(() => {});
    }, [checkSuccess]);

    useEffect(() => {
        axios
            .get("/payment-cards/active")
            .then((res) => setPaymentCards(res.data))
            .catch(() => {});
    }, []);

    const copyCard = (card) => {
        const raw = card.card_number.replace(/\s/g, "");
        navigator.clipboard.writeText(raw).then(() => {
            setCopiedId(card.id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const handleClickPay = async () => {
        if (!amount) return;
        try {
            setLoading(true);
            const res = await axios.post("/payment/create", {
                telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
                amount,
            });
            if (res.data.payment_url)
                window.location.href = res.data.payment_url;
        } catch {
            alert(t("balance.click_error"));
        } finally {
            setLoading(false);
        }
    };

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setReceiptFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const removeFile = () => {
        setReceiptFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCheckSubmit = async () => {
        if (!receiptFile || !checkAmount || parseFloat(checkAmount) < 1000)
            return;
        try {
            setCheckLoading(true);
            const form = new FormData();
            form.append("amount", checkAmount);
            form.append("receipt", receiptFile);
            await axios.post("/manual-topup", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setCheckSuccess(true);
            setCheckAmount("");
            removeFile();
            setTimeout(() => setCheckSuccess(false), 5000);
        } catch (e) {
            alert(e.response?.data?.message ?? t("others.error"));
        } finally {
            setCheckLoading(false);
        }
    };

    const checkDisabled =
        !receiptFile ||
        !checkAmount ||
        parseFloat(checkAmount) < 1000 ||
        checkLoading;

    return (
        <>
            <Head title={t("balance.page_title")} />

            <div className="min-h-[calc(100vh-140px)] px-4 py-6 pb-24 lg:pb-8 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* ── Balance card ── */}
                    <div className="rounded-3xl shadow-xl overflow-hidden">
                        <div className="bg-linear-to-br from-blue-500 via-blue-600 to-indigo-700 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">
                                        {t("balance.current_balance")}
                                    </p>
                                    <p className="text-4xl font-bold text-white mt-1">
                                        {Number(
                                            user?.balance ?? 0,
                                        ).toLocaleString("fr-FR")}
                                        <span className="text-xl font-semibold text-blue-200 ml-2">
                                            UZS
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-white/20 p-4 rounded-2xl border border-white/20">
                                    <CreditCard className="size-10 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Payment method selector ── */}
                    <div>
                        <h2 className="text-base font-bold text-slate-700 dark:text-white mb-3">
                            {t("balance.select_method")}
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {paymentMethods.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() =>
                                        !m.disabled && setSelectedMethod(m.id)
                                    }
                                    disabled={m.disabled}
                                    className={`relative rounded-2xl p-4 border-2 text-left transition-all
            ${
                m.disabled
                    ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60 cursor-not-allowed grayscale"
                    : selectedMethod === m.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600"
            }`}
                                >
                                    {/* Under construction badge */}
                                    {m.disabled && (
                                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
                                            🚧 Tez kunda
                                        </span>
                                    )}
                                    <div className="text-3xl mb-2">
                                        {m.icon === "🇺🇿" ? null : m.icon}
                                        {m.iconComponent && (
                                            <img
                                                src={m.iconComponent}
                                                alt={m.label}
                                                className="inline-block w-26 h-10 -ml-3  -mt-1"
                                            />
                                        )}
                                    </div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white">
                                        {m.label}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {m.desc}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Click payment ── */}
                    {selectedMethod === "click" && (
                        <div className="rounded-2xl shadow p-5 bg-white dark:bg-slate-800 space-y-4 border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white">
                                {t("balance.enter_amount")}
                            </h3>

                            <div className="grid grid-cols-3 gap-2">
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setAmount(String(amt))}
                                        className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                                            amount === String(amt)
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600"
                                        }`}
                                    >
                                        {Number(amt).toLocaleString("fr-FR")}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <input
                                    type="number"
                                    min="1000"
                                    placeholder={t(
                                        "balance.amount_placeholder",
                                    )}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full h-14 text-xl px-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                    UZS
                                </span>
                            </div>

                            <button
                                onClick={handleClickPay}
                                disabled={
                                    !amount || parseFloat(amount) < 1 || loading
                                }
                                className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                            >
                                {loading ? (
                                    <>
                                        <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        {t("others.loading")}
                                    </>
                                ) : (
                                    `${Number(amount || 0).toLocaleString("fr-FR")} UZS ${t("balance.pay_btn")}`
                                )}
                            </button>
                        </div>
                    )}

                    {/* ── Manual / receipt payment ── */}
                    {selectedMethod === "manual" && (
                        <div className="rounded-2xl shadow p-5 bg-white dark:bg-slate-800 space-y-4 border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white">
                                {t("balance.manual_title")}
                            </h3>

                            {/* Payment cards */}
                            {paymentCards.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        To'lov kartalari
                                    </p>

                                    <Swiper
                                        modules={[Pagination]}
                                        slidesPerView={1.1}
                                        spaceBetween={12}
                                        centeredSlides={true}
                                        pagination={{ clickable: true }}
                                        className="pb-7!"
                                    >
                                        {paymentCards.map((card) => (
                                            <SwiperSlide key={card.id}>
                                                <div
                                                    className={`relative rounded-2xl p-5 bg-linear-to-br ${cardGradients[paymentCards.indexOf(card) % cardGradients.length]} text-white shadow-lg`}
                                                >
                                                    {/* Top row */}
                                                    <div className="flex items-center justify-between mb-5">
                                                        <p className="font-bold text-lg tracking-wide">
                                                            {card.bank_name ??
                                                                "Card"}
                                                        </p>
                                                        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm">
                                                            {paymentCards.indexOf(
                                                                paymentCards.find(
                                                                    (c) =>
                                                                        c.id ===
                                                                        card.id,
                                                                ),
                                                            ) + 1}
                                                            /
                                                            {
                                                                paymentCards.length
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* Card number */}
                                                    <div className="flex items-center justify-between mb-5">
                                                        <p className="font-mono text-xl font-bold tracking-widest">
                                                            {card.card_number}
                                                        </p>
                                                        <button
                                                            onClick={() =>
                                                                copyCard(card)
                                                            }
                                                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2.5 rounded-xl transition-all active:scale-95"
                                                        >
                                                            {copiedId ===
                                                            card.id ? (
                                                                <CheckCircle className="size-5" />
                                                            ) : (
                                                                <Copy className="size-5" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Card holder */}
                                                    {card.card_holder && (
                                                        <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                                                            {card.card_holder}
                                                        </p>
                                                    )}
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            )}

                            {/* Steps */}
                            <ol className="space-y-2">
                                {[
                                    t("balance.manual_step1"),
                                    t("balance.manual_step2"),
                                    t("balance.manual_step3"),
                                ].map((step, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {step}
                                        </span>
                                    </li>
                                ))}
                            </ol>

                            {/* Receipt image upload */}
                            {!preview ? (
                                <button
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl h-36 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                                >
                                    <Upload className="size-8" />
                                    <span className="text-sm font-medium">
                                        {t("balance.upload_label")}
                                    </span>
                                    <span className="text-xs opacity-70">
                                        {t("balance.upload_hint")}
                                    </span>
                                </button>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={preview}
                                        alt="Chek"
                                        className="w-full max-h-64 object-contain rounded-xl border border-slate-200 dark:border-slate-600"
                                    />
                                    <button
                                        onClick={removeFile}
                                        className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 transition-colors"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={onFileChange}
                            />

                            {/* Amount input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    {t("balance.transferred_amount")}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1000"
                                        placeholder="50 000"
                                        value={checkAmount}
                                        onChange={(e) =>
                                            setCheckAmount(e.target.value)
                                        }
                                        className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white text-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                        UZS
                                    </span>
                                </div>
                            </div>

                            {/* Success message */}
                            {checkSuccess && (
                                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-sm font-medium">
                                    <CheckCircle className="size-5 shrink-0" />
                                    {t("balance.check_success")}
                                </div>
                            )}

                            <button
                                onClick={handleCheckSubmit}
                                disabled={checkDisabled}
                                className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                            >
                                {checkLoading ? (
                                    <>
                                        <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        {t("balance.submitting")}
                                    </>
                                ) : (
                                    t("balance.submit_receipt")
                                )}
                            </button>
                        </div>
                    )}

                    {/* ── Request history ── */}
                    {myRequests.length > 0 && (
                        <div className="rounded-2xl shadow p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Receipt className="size-5 text-slate-500 dark:text-slate-400" />
                                {t("balance.history_title")}
                            </h3>
                            <div className="space-y-0">
                                {myRequests.map((r) => {
                                    const s = STATUS_LABEL[r.status] ?? {
                                        text: r.status,
                                        cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
                                    };
                                    return (
                                        <div
                                            key={r.id}
                                            className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                                    {Number(
                                                        r.amount,
                                                    ).toLocaleString(
                                                        "fr-FR",
                                                    )}{" "}
                                                    UZS
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Clock className="size-3" />
                                                    {new Date(
                                                        r.created_at,
                                                    ).toLocaleString("ru-RU")}
                                                </p>
                                                {r.notes && (
                                                    <p className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">
                                                        {r.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <span
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}
                                            >
                                                {s.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default UserBalance;
