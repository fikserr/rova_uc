import ClickLogo from "@images/click_logo.png";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    CheckCircle,
    Clock,
    Copy,
    ExternalLink,
    HelpCircle,
    Receipt,
    Upload,
    Wallet,
    X,
    Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination , Navigation} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

function UserBalance() {
    const { t } = useTranslation();
    const { user } = usePage().props;

    const STATUS_LABEL = {
        pending: {
            text: t("balance.status.pending"),
            cls: "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-[#FFB020]/10 dark:text-[#FFB020] dark:border-[#FFB020]/20",
        },
        approved: {
            text: t("balance.status.approved"),
            cls: "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-[#10B981]/10 dark:text-[#10B981] dark:border-[#10B981]/20",
        },
        rejected: {
            text: t("balance.status.rejected"),
            cls: "bg-red-50 text-red-600 border border-red-200 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20",
        },
    };

    const cardGradients = [
        "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #38bdf8 100%)",
        "linear-gradient(135deg, #A74971 0%, #6C2947 100%)",
        "linear-gradient(135deg, #D946EF 0%, #A21CAF 50%, #701A75 100%)",
        "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)",
        "linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%)",
        "linear-gradient(135deg, #FACC15 0%, #EAB308 50%, #CA8A04 100%)",
    ];

    const [selectedMethod, setSelectedMethod] = useState("manual");

    // Click state
    const [clickAmount, setClickAmount] = useState("");
    const [clickLoading, setClickLoading] = useState(false);

    // Chek (manual) state
    const [checkAmount, setCheckAmount] = useState("");
    const [receiptFile, setReceiptFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [checkLoading, setCheckLoading] = useState(false);
    const [checkSuccess, setCheckSuccess] = useState(false);
    const [checkError, setCheckError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [myRequests, setMyRequests] = useState([]);
    const [paymentCards, setPaymentCards] = useState([]);
    const [randomStart, setRandomStart] = useState(1);
    const [copiedId, setCopiedId] = useState(null);
    const fileInputRef = useRef(null);
    const submittingRef = useRef(false);

    const quickAmounts = [10000, 30000, 50000, 100000, 200000, 500000];

    useEffect(() => {
        axios
            .get("/manual-topup/my")
            .then((r) => setMyRequests(r.data))
            .catch(() => {});
    }, [checkSuccess]);

    useEffect(() => {
        axios
            .get("/payment-cards/active")
            .then((r) => {
                setPaymentCards(r.data);
                
                if (r.data.length > 0) {
                    setRandomStart(Math.floor(Math.random() * r.data.length));
                }
            })
            .catch(() => {});
    }, []);

    const copyCard = (card) => {
        navigator.clipboard
            .writeText(card.card_number.replace(/\s/g, ""))
            .then(() => {
                setCopiedId(card.id);
                setTimeout(() => setCopiedId(null), 2000);
            });
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

    const handleClickPay = async () => {
        const amt = parseFloat(clickAmount);
        if (!amt || amt < 1000) return;
        try {
            setClickLoading(true);
            const res = await axios.post("/payment/create", {
                order_type: "topup",
                amount: amt,
                payment_method: "click",
            });
            if (res.data.payment_url) {
                window.location.href = res.data.payment_url;
            }
        } catch (e) {
            alert(e.response?.data?.message ?? t("others.error"));
        } finally {
            setClickLoading(false);
        }
    };

    const handleCheckSubmit = async () => {
        if (submittingRef.current) return;
        if (!receiptFile || !checkAmount || parseFloat(checkAmount) < 1000)
            return;
        submittingRef.current = true;
        setCheckError(null);
        try {
            setCheckLoading(true);
            setUploadProgress(0);
            const form = new FormData();
            form.append("amount", checkAmount);
            form.append("receipt", receiptFile);
            await axios.post("/manual-topup", form, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (e) => {
                    if (e.total) {
                        setUploadProgress(
                            Math.round((e.loaded * 100) / e.total),
                        );
                    }
                },
            });
            setCheckSuccess(true);
            setCheckAmount("");
            removeFile();
            setTimeout(() => setCheckSuccess(false), 5000);
            axios
                .get("/manual-topup/my")
                .then((r) => setMyRequests(r.data))
                .catch(() => {});
        } catch (e) {
            const msg = e.response?.data?.errors
                ? Object.values(e.response.data.errors).flat().join(" ")
                : (e.response?.data?.message ?? t("others.error"));
            setCheckError(msg);
            setTimeout(() => setCheckError(null), 8000);
        } finally {
            setCheckLoading(false);
            setUploadProgress(0);
            submittingRef.current = false;
        }
    };

    const METHODS = [
        { key: "click", label: "Click", color: "blue" },
        { key: "manual", label: t("balance.method_manual"), color: "indigo" },
    ];

    return (
        <>
            <Head title={t("balance.page_title")} />

            <div className="w-full text-slate-900 dark:text-[#F1F5F9] antialiased container mx-auto px-3 sm:px-4 pt-8 pb-30 transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* LEFT: Balance + Method tabs */}
                    <div className="lg:col-span-8 space-y-5">
                        {/* Balance block */}
                        <div className="rounded-2xl bg-white dark:bg-[#0F1021] p-5 border border-slate-200 dark:border-white/4 shadow-xl flex items-center justify-between">
                            <div>
                                <span className="text-slate-500 dark:text-[#94A3B8] text-xs font-medium uppercase tracking-wider block">
                                    {t("balance.current_balance")}
                                </span>
                                <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1 block tracking-tight">
                                    {Number(user?.balance ?? 0).toLocaleString(
                                        "fr-FR",
                                    )}{" "}
                                    <span className="text-sm font-semibold text-slate-400 dark:text-[#64748B]">
                                        uzs
                                    </span>
                                </span>
                            </div>
                            <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                <Wallet className="size-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>

                        {/* Method tabs */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-widest block px-0.5">
                                {t("balance.select_method")}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Click */}
                                <button
                                    disabled
                                    onClick={() => setSelectedMethod("click")}
                                    className="relative rounded-xl border-2 border-amber-400/60 cursor-not-allowed p-4 text-left flex flex-col justify-between h-24 transition-all duration-200 bg-amber-50/50 dark:bg-amber-500/5 opacity-80"
                                >
                                    <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-[9px] font-bold text-amber-950 tracking-wide shadow-sm">
                                        {t("balance.coming_soon")}
                                    </span>
                                    <img
                                        src={ClickLogo}
                                        alt="Click"
                                        className="h-4 w-auto object-contain self-start grayscale opacity-60"
                                    />
                                    <span className="font-bold text-xs text-slate-500 dark:text-slate-400 tracking-wide">
                                        Click
                                    </span>
                                </button>

                                {/* Chek */}
                                <button
                                    onClick={() => setSelectedMethod("manual")}
                                    className={`rounded-xl p-4 border text-left flex flex-col justify-between h-24 transition-all duration-200 ${
                                        selectedMethod === "manual"
                                            ? "border-[#6366F1] bg-indigo-50 dark:bg-[#6366F1]/6 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/5 dark:bg-[#0F1021] dark:hover:border-white/10"
                                    }`}
                                >
                                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-[#6366F1]/10 text-indigo-600 dark:text-[#818CF8] inline-block">
                                        <Receipt className="size-4" />
                                    </div>
                                    <span className="font-bold text-xs text-slate-900 dark:text-white tracking-wide">
                                        {t("balance.method_manual")}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Card slider — only for manual */}
                        {selectedMethod === "manual" &&
                            paymentCards.length > 0 && (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between text-xs font-bold tracking-wide text-slate-500 dark:text-[#94A3B8]">
                                        <span className="uppercase text-[11px]">
                                            {t("balance.payment_cards_label")}
                                        </span>
                                    </div>
                                    <div className="pt-1">
                                        <Swiper
                                            modules={[Pagination, Autoplay, Navigation]}
                                            slidesPerView={1}
                                            spaceBetween={14}
                                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                                            loop={true}
                                            initialSlide={randomStart}
                                            pagination={{ clickable: true }}
                                            breakpoints={{
                                                480: { slidesPerView: 1 },
                                                768: { slidesPerView: 2 },
                                                1024: { slidesPerView: 2.2 },
                                            }}
                                            className="pb-8 h-52"
                                        >
                                            {paymentCards.map((card, idx) => (
                                                <SwiperSlide key={card.id}>
                                                    <div
                                                        className="relative w-full h-full rounded-2xl p-4 sm:p-5 overflow-hidden  border-[#6366F1] bg-indigo-50 dark:bg-[#6366F1]/6 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                                                        style={{
                                                            background:
                                                                cardGradients[
                                                                    idx %
                                                                        cardGradients.length
                                                                ],
                                                        }}
                                                    >
                                                        <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/10 pointer-events-none" />
                                                        <div className="absolute -right-2 top-10 size-16 rounded-full bg-white/5 pointer-events-none" />
                                                        <div className="relative h-full flex flex-col justify-between">
                                                            <div className="flex items-start justify-between">
                                                                <div className="w-8 h-6 rounded-md bg-linear-to-br from-yellow-200 to-yellow-400 shadow-sm" />
                                                                <span className="text-white font-extrabold text-sm tracking-wide drop-shadow-md">
                                                                    {card.bank_name ??
                                                                        "UZCARD"}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white/90 font-mono text-base tracking-[0.2em] font-bold">
                                                                    {
                                                                        card.card_number
                                                                    }
                                                                </p>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <p className="text-white/70 text-[10px] font-medium tracking-wide uppercase">
                                                                        {card.card_holder ??
                                                                            "VALLER GAMING"}
                                                                    </p>
                                                                    <button
                                                                        onClick={() =>
                                                                            copyCard(
                                                                                card,
                                                                            )
                                                                        }
                                                                        className="bg-black/20 hover:bg-black/40 active:scale-95 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all backdrop-blur-md text-white/90 border border-white/10"
                                                                    >
                                                                        {copiedId ===
                                                                        card.id ? (
                                                                            <CheckCircle className="size-3.5 text-emerald-300 animate-pulse" />
                                                                        ) : (
                                                                            <Copy className="size-3.5" />
                                                                        )}
                                                                        Copy
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* RIGHT: Action panel */}
                    <div className="lg:col-span-4">
                        {/* === CLICK === */}
                        {selectedMethod === "click" && (
                            <div className="rounded-2xl p-5 bg-white dark:bg-[#0F1021] border border-slate-200 dark:border-white/4 shadow-xl space-y-5">
                                <div className="border-b border-slate-200 dark:border-white/4 pb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Click
                                    </h3>
                                    <Zap className="size-4 text-blue-500" />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Click orqali tezda to'lang — to'lov
                                    tasdiqlangandan so'ng balans avtomatik
                                    tushadi.
                                </p>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-[#64748B] uppercase tracking-wider">
                                        {t("balance.transferred_amount")}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1000"
                                            placeholder={t(
                                                "balance.amount_placeholder",
                                            )}
                                            value={clickAmount}
                                            onChange={(e) =>
                                                setClickAmount(e.target.value)
                                            }
                                            className="w-full h-11 px-4 pr-14 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/1 text-slate-900 dark:text-white font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-300 dark:placeholder:text-[#334155]"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 font-mono">
                                            UZS
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {quickAmounts.slice(0, 6).map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() =>
                                                setClickAmount(String(amt))
                                            }
                                            className={`py-2 px-1 text-xs font-mono font-bold rounded-xl border transition-all text-center ${
                                                clickAmount === String(amt)
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 dark:border-white/4 dark:bg-white/0.5 dark:text-[#64748B]"
                                            }`}
                                        >
                                            {Number(amt).toLocaleString(
                                                "fr-FR",
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleClickPay}
                                    disabled={
                                        !clickAmount ||
                                        parseFloat(clickAmount) < 1000 ||
                                        clickLoading
                                    }
                                    className="w-full h-11 font-bold text-xs bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg"
                                >
                                    {clickLoading ? (
                                        <>
                                            <span className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />{" "}
                                            Yuklanmoqda...
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink className="size-3.5" />{" "}
                                            Click orqali to'lash
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* === CHEK (MANUAL) === */}
                        {selectedMethod === "manual" && (
                            <div className="rounded-2xl p-5 bg-white dark:bg-[#0F1021] border border-slate-200 dark:border-white/4 shadow-xl space-y-5">
                                <div className="border-b border-slate-200 dark:border-white/4 pb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        {t("balance.manual_title")}
                                    </h3>
                                    <HelpCircle className="size-4 text-slate-400 dark:text-[#475569]" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                                        {t("balance.method_manual")}
                                    </p>
                                    <ol className="space-y-1.5 text-xs text-slate-500 dark:text-[#64748B] font-medium">
                                        {[
                                            "balance.manual_step1",
                                            "balance.manual_step2",
                                            "balance.manual_step3",
                                        ].map((key, i) => (
                                            <li
                                                key={key}
                                                className="flex items-start gap-2.5"
                                            >
                                                <span className="size-4 rounded-full bg-indigo-50 dark:bg-[#6366F1]/10 text-indigo-600 dark:text-[#818CF8] border border-indigo-200 dark:border-[#6366F1]/20 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span>{t(key)}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Dropzone */}
                                <div className="pt-1">
                                    {!preview ? (
                                        <button
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="w-full border border-dashed border-slate-300 hover:border-[#6366F1]/50 dark:border-white/10 rounded-xl h-36 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 dark:bg-white/0.5 dark:hover:bg-[#6366F1]/1 text-slate-400 dark:text-[#64748B] transition-all group"
                                        >
                                            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 dark:bg-white/2 dark:border-white/4 text-indigo-600 dark:text-[#818CF8] group-hover:scale-105 transition-transform">
                                                <Upload className="size-5" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-[#E2E8F0]">
                                                {t("balance.upload_label")}
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-[#475569] font-medium max-w-sm text-center px-4 leading-relaxed">
                                                {t("balance.upload_hint")}
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="relative rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 p-3 flex justify-center items-center group shadow-inner">
                                            <img
                                                src={preview}
                                                alt="Chek"
                                                className="max-h-40 rounded-lg object-contain shadow-lg"
                                            />
                                            <button
                                                onClick={removeFile}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1.5 transition-colors shadow-md"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={onFileChange}
                                />

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-[#64748B] uppercase tracking-wider">
                                        {t("balance.transferred_amount")}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1000"
                                            placeholder={t(
                                                "balance.amount_placeholder",
                                            )}
                                            value={checkAmount}
                                            onChange={(e) =>
                                                setCheckAmount(e.target.value)
                                            }
                                            className="w-full h-11 px-4 pr-14 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/1 text-slate-900 dark:text-white font-mono text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all placeholder:text-slate-300 dark:placeholder:text-[#334155]"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 font-mono">
                                            UZS
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-0.5">
                                    {quickAmounts.slice(0, 3).map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() =>
                                                setCheckAmount(String(amt))
                                            }
                                            className={`py-2 px-1 text-xs font-mono font-bold rounded-xl border transition-all text-center ${
                                                checkAmount === String(amt)
                                                    ? "border-[#6366F1] bg-indigo-50 dark:bg-[#6366F1]/10 text-indigo-600 dark:text-[#818CF8]"
                                                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 dark:border-white/4 dark:bg-white/0.5 dark:text-[#64748B]"
                                            }`}
                                        >
                                            {Number(amt).toLocaleString(
                                                "fr-FR",
                                            )}{" "}
                                            <span className="text-[10px] font-sans font-medium text-slate-400">
                                                UZS
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {checkError && (
                                    <div className="flex items-start gap-2.5 bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 rounded-xl p-3 text-xs font-semibold">
                                        <X className="size-4 shrink-0 mt-0.5" />
                                        {checkError}
                                    </div>
                                )}

                                {checkSuccess && (
                                    <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 rounded-xl p-3 text-xs font-semibold">
                                        <CheckCircle className="size-4 shrink-0" />
                                        {t("balance.check_success")}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <button
                                        onClick={handleCheckSubmit}
                                        disabled={
                                            !receiptFile ||
                                            !checkAmount ||
                                            parseFloat(checkAmount) < 1000 ||
                                            checkLoading
                                        }
                                        className="w-full h-11 font-bold text-xs bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.99] text-white rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-indigo-950/40"
                                    >
                                        {checkLoading ? (
                                            <>
                                                <span className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />{" "}
                                                {uploadProgress < 100
                                                    ? `${t("balance.uploading")} ${uploadProgress}%`
                                                    : t("balance.submitting")}
                                            </>
                                        ) : (
                                            t("balance.submit_receipt")
                                        )}
                                    </button>
                                    {checkLoading && (
                                        <div className="w-full h-1.5 bg-indigo-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${uploadProgress}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* History */}
                {myRequests.length > 0 && (
                    <div className="rounded-2xl p-5 bg-white dark:bg-[#0F1021] border border-slate-200 dark:border-white/4 shadow-xl space-y-4 mt-5">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 dark:text-[#94A3B8] flex items-center gap-2">
                            <Receipt className="size-4 text-slate-400 dark:text-[#475569]" />
                            {t("balance.history_title")}
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/2">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/4 text-slate-500 dark:text-[#475569] uppercase tracking-wider text-[10px] font-bold bg-slate-50 dark:bg-white/0.5">
                                        <th className="p-3 font-semibold">
                                            {t("balance.transferred_amount")}
                                        </th>
                                        <th className="p-3 font-semibold text-right">
                                            {t("balance.status_column")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {myRequests.map((r) => {
                                        const s = STATUS_LABEL[r.status] ?? {
                                            text: r.status,
                                            cls: "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400",
                                        };
                                        return (
                                            <tr
                                                key={r.id}
                                                className="hover:bg-slate-50 dark:hover:bg-white/0.5 transition-colors"
                                            >
                                                <td className="p-3">
                                                    <p className="font-mono font-bold text-slate-900 dark:text-white text-sm tracking-wide">
                                                        {Number(
                                                            r.amount,
                                                        ).toLocaleString(
                                                            "fr-FR",
                                                        )}{" "}
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">
                                                            UZS
                                                        </span>
                                                    </p>
                                                    <p className="text-[10px] font-mono text-slate-400 dark:text-[#475569] mt-0.5 flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {new Date(
                                                            r.created_at,
                                                        ).toLocaleDateString(
                                                            "ru-RU",
                                                        )}{" "}
                                                        {new Date(
                                                            r.created_at,
                                                        ).toLocaleTimeString(
                                                            "ru-RU",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            },
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <p
                                                        className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${s.cls}`}
                                                    >
                                                        {s.text}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default UserBalance;
