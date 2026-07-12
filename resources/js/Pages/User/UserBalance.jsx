import ClickLogo from "@images/click_logo.png";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    CheckCircle,
    Clock,
    Copy,
    HelpCircle,
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

import { Autoplay } from "swiper/modules";

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
        "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #38bdf8 100%)", // Premium Uzcard Blue
        "from-[#A74971] to-[#6C2947]", // Humo Premium Blend
        "from-[#D946EF] via-[#A21CAF] to-[#701A75]", // Visa Gradient
    ];

    const [selectedMethod, setSelectedMethod] = useState("manual");
    const [checkAmount, setCheckAmount] = useState("");
    const [receiptFile, setReceiptFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [checkLoading, setCheckLoading] = useState(false);
    const [checkSuccess, setCheckSuccess] = useState(false);
    const [myRequests, setMyRequests] = useState([]);
    const [paymentCards, setPaymentCards] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    const fileInputRef = useRef(null);

    const quickAmounts = [10000, 30000, 100000, 50000, 200000, 500000];

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

    return (
        <>
            <Head title={t("balance.page_title")} />

            {/* Central Panel Layout matching premium aesthetic */}
            <div className="w-full text-slate-900 dark:text-[#F1F5F9] antialiased container mx-auto px-3 sm:px-4 pt-8 pb-30  transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* LEFT PANEL: Account Overview & Selection Cards */}
                    <div className="lg:col-span-8 space-y-5">
                        {/* Interactive Balance Display Block */}
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
                        </div>

                        {/* Payment Selection Tab Grid Container */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-widest block px-0.5">
                                {t("balance.select_method")}
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Disabled Click / Payme Variant */}
                                <div className="rounded-xl p-4 border border-amber-300 bg-slate-50 dark:bg-white/1 opacity-60 dark:opacity-35 cursor-not-allowed flex flex-col justify-between h-24 relative overflow-hidden">
                                    <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 uppercase">
                                        {t("balance.coming_soon")}
                                    </span>
                                    <img
                                        src={ClickLogo}
                                        alt="Click logo"
                                        className="h-4 w-auto object-contain self-start grayscale"
                                    />
                                    <span className="font-bold text-xs text-slate-500 dark:text-slate-400">
                                        {t("balance.method_click")}
                                    </span>
                                </div>

                                {/* Active Manual Payment Method */}
                                <button
                                    onClick={() => setSelectedMethod("manual")}
                                    className={`rounded-xl p-4 border text-left flex flex-col justify-between h-24 transition-all duration-200 relative
                                        ${
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

                        {/* Credit Cards Slider Panel Layout */}
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
                                            modules={[Pagination, Autoplay]}
                                            slidesPerView={1}
                                            spaceBetween={14}
                                            loop={true}
                                            autoplay={{
                                                delay: 2200,
                                                disableOnInteraction: false,
                                            }}
                                            pagination={{ clickable: true }}
                                            breakpoints={{
                                                480: { slidesPerView: 1 },
                                                768: { slidesPerView: 2 },
                                                1024: { slidesPerView: 2.2 },
                                            }}
                                            className="pb-8 h-52"
                                        >
                                            {paymentCards.map((card, idx) => {
                                                return (
                                                    <SwiperSlide key={card.id}>
                                                        <div
                                                            className={`relative bg-linear-to-br ${cardGradients[idx]} w-full h-full rounded-2xl p-4 sm:p-5 overflow-hidden shadow-xl`}
                                                            style={{
                                                                background:
                                                                    cardGradients[
                                                                        idx %
                                                                            cardGradients.length
                                                                    ],
                                                            }}
                                                        >
                                                            {/* Decorative background circles - card visuals stay the same in both themes */}
                                                            <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/10 pointer-events-none" />
                                                            <div className="absolute -right-2 top-10 size-16 rounded-full bg-white/5 pointer-events-none" />

                                                            <div className="relative h-full flex flex-col justify-between">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="w-8 h-6 rounded-md bg-linear-to-br from-yellow-200 to-yellow-400 shadow-sm" />
                                                                    <span className="text-white font-extrabold text-sm sm:text-base tracking-wide drop-shadow-md">
                                                                        {card.bank_name ??
                                                                            "UZCARD"}
                                                                    </span>
                                                                </div>

                                                                <div>
                                                                    <p className="text-white/90 font-mono text-base sm:text-lg tracking-[0.2em] font-bold drop-shadow-sm">
                                                                        {
                                                                            card.card_number
                                                                        }
                                                                    </p>

                                                                    <div className="flex items-center justify-between mt-2">
                                                                        <p className="text-white/70 text-[10px] sm:text-xs font-medium tracking-wide uppercase">
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
                                                );
                                            })}
                                        </Swiper>
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* RIGHT PANEL: Form Inputs & Action Flows */}
                    {selectedMethod === "manual" && (
                        <div className="lg:col-span-4 rounded-2xl p-5 bg-white dark:bg-[#0F1021] border border-slate-200 dark:border-white/4 shadow-xl space-y-5">
                            <div className="border-b border-slate-200 dark:border-white/4 pb-3 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    {t("balance.manual_title")}
                                </h3>
                                <HelpCircle className="size-4 text-slate-400 dark:text-[#475569]" />
                            </div>

                            {/* Process Steps Grouping */}
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                                    {t("balance.method_manual")}
                                </p>
                                <ol className="space-y-1.5 text-xs text-slate-500 dark:text-[#64748B] font-medium">
                                    <li className="flex items-start gap-2.5">
                                        <span className="size-4 rounded-full bg-indigo-50 dark:bg-[#6366F1]/10 text-indigo-600 dark:text-[#818CF8] border border-indigo-200 dark:border-[#6366F1]/20 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                            1
                                        </span>
                                        <span>{t("balance.manual_step1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="size-4 rounded-full bg-indigo-50 dark:bg-[#6366F1]/10 text-indigo-600 dark:text-[#818CF8] border border-indigo-200 dark:border-[#6366F1]/20 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                            2
                                        </span>
                                        <span>{t("balance.manual_step2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="size-4 rounded-full bg-indigo-50 dark:bg-[#6366F1]/10 text-indigo-600 dark:text-[#818CF8] border border-indigo-200 dark:border-[#6366F1]/20 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                            3
                                        </span>
                                        <span>{t("balance.manual_step3")}</span>
                                    </li>
                                </ol>
                            </div>

                            {/* Dropzone Component */}
                            <div className="pt-1">
                                {!preview ? (
                                    <button
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="w-full border border-dashed border-slate-300 hover:border-[#6366F1]/50 dark:border-white/10 rounded-xl h-36 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 dark:bg-white/0.5 dark:hover:bg-[#6366F1]/1 text-slate-400 dark:text-[#64748B] transition-all group"
                                    >
                                        <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 dark:bg-white/2 dark:border-white/4 text-indigo-600 dark:text-[#818CF8] group-hover:scale-105 transition-transform shadow-inner">
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
                                            alt="Check digital preview"
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
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={onFileChange}
                            />

                            {/* Standard Number Form Inputs */}
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
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 dark:text-[#475569] font-mono">
                                        UZS
                                    </span>
                                </div>
                            </div>

                            {/* Quick Select Quick Button Row Array */}
                            <div className="grid grid-cols-3 gap-2 pt-0.5">
                                {quickAmounts.slice(0, 3).map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() =>
                                            setCheckAmount(String(amt))
                                        }
                                        className={`py-2 px-1 text-xs font-mono font-bold rounded-xl border transition-all duration-150 text-center
                                            ${
                                                checkAmount === String(amt)
                                                    ? "border-[#6366F1] bg-indigo-50 dark:bg-[#6366F1]/10 text-indigo-600 dark:text-[#818CF8] shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-white/4 dark:bg-white/0.5 dark:text-[#64748B] dark:hover:border-white/10 dark:hover:text-white"
                                            }`}
                                    >
                                        {Number(amt).toLocaleString("fr-FR")}{" "}
                                        <span className="text-[10px] font-sans font-medium text-slate-400 dark:text-slate-500">
                                            UZS
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Informational Flash Message Prompt */}
                            {checkSuccess && (
                                <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 rounded-xl p-3 text-xs font-semibold animate-fadeIn">
                                    <CheckCircle className="size-4 shrink-0" />
                                    {t("balance.check_success")}
                                </div>
                            )}

                            {/* Main CTA Submission Button */}
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
                                        <span className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        {t("balance.submitting")}
                                    </>
                                ) : (
                                    t("balance.submit_receipt")
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* BOTTOM COMPONENT: Transaction Log History Row Layout */}
                {myRequests.length > 0 && (
                    <div className="rounded-2xl p-5 bg-white dark:bg-[#0F1021] border border-slate-200 dark:border-white/4 shadow-xl space-y-4 mt-5">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 dark:text-[#94A3B8] flex items-center gap-2">
                            <Receipt className="size-4 text-slate-400 dark:text-[#475569]" />{" "}
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
                                                    <span
                                                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${s.cls}`}
                                                    >
                                                        {s.text}
                                                    </span>
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
