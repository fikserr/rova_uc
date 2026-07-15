import ClickLogo from "@images/click_logo.png";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Copy,
    ExternalLink,
    Receipt,
    Upload,
    Wallet,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const BinanceLogo = () => (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
        <path d="M12 0L7.273 4.727l1.818 1.818L12 3.636l2.909 2.909 1.818-1.818L12 0zM4.727 7.273L0 12l4.727 4.727 1.818-1.818L3.636 12l2.909-2.909-1.818-1.818zm14.546 0l-1.818 1.818L20.364 12l-2.909 2.909 1.818 1.818L24 12l-4.727-4.727zM12 8.727L9.091 11.636 12 14.545l2.909-2.909L12 8.727zM7.273 19.273L12 24l4.727-4.727-1.818-1.818L12 20.364l-2.909-2.909-1.818 1.818z" />
    </svg>
);

const CARD_GRADIENTS = [
    "linear-gradient(135deg,#312e81 0%,#4f46e5 60%,#818cf8 100%)",
    "linear-gradient(135deg,#701a75 0%,#a21caf 60%,#e879f9 100%)",
    "linear-gradient(135deg,#0c4a6e 0%,#0284c7 60%,#38bdf8 100%)",
];

const QUICK = [10000, 30000, 50000, 100000, 200000, 500000];
function fmt(n) { return Number(n ?? 0).toLocaleString("fr-FR"); }

const METHODS = [
    { key: "binance", label: "Binance Pay", accent: "yellow" },
    { key: "click",   label: "Click",       accent: "blue" },
    { key: "chek",    label: "Chek",        accent: "violet" },
];

const ACCENT = {
    yellow: {
        ring:   "ring-yellow-400/40 border-yellow-400/30 bg-yellow-400/5",
        btn:    "bg-yellow-400 hover:bg-yellow-300 text-black",
        quick:  "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
        focus:  "focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/20",
        active: "text-yellow-300 border-yellow-400/30 bg-yellow-400/8",
        tab:    "border-yellow-400/30 text-yellow-300",
    },
    blue: {
        ring:   "ring-blue-400/40 border-blue-400/30 bg-blue-400/5",
        btn:    "bg-blue-500 hover:bg-blue-400 text-white",
        quick:  "border-blue-400/40 bg-blue-400/10 text-blue-300",
        focus:  "focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20",
        active: "text-blue-300 border-blue-400/30 bg-blue-400/8",
        tab:    "border-blue-400/30 text-blue-300",
    },
    violet: {
        ring:   "ring-violet-400/40 border-violet-400/30 bg-violet-400/5",
        btn:    "bg-violet-600 hover:bg-violet-500 text-white",
        quick:  "border-violet-400/40 bg-violet-400/10 text-violet-300",
        focus:  "focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/20",
        active: "text-violet-300 border-violet-400/30 bg-violet-400/8",
        tab:    "border-violet-400/30 text-violet-300",
    },
};

const HISTORY_STATUS = {
    pending:  { label: "Kutilmoqda", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    approved: { label: "Tasdiqlandi", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    rejected: { label: "Rad etildi",  cls: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
};

export default function ResellerBalance() {
    const { user } = usePage().props;

    const [method, setMethod] = useState("binance");
    const ac = ACCENT[METHODS.find(m => m.key === method)?.accent ?? "violet"];

    // Click
    const [clickAmt, setClickAmt]         = useState("");
    const [clickLoading, setClickLoading] = useState(false);

    // Binance
    const [bnbAmt, setBnbAmt]             = useState("");
    const [bnbLoading, setBnbLoading]     = useState(false);
    const [usdtRate, setUsdtRate]         = useState(0);

    // Chek
    const [chekAmt, setChekAmt]           = useState("");
    const [chekFile, setChekFile]         = useState(null);
    const [preview, setPreview]           = useState(null);
    const [chekLoading, setChekLoading]   = useState(false);
    const [chekOk, setChekOk]             = useState(false);

    const [cards, setCards]     = useState([]);
    const [history, setHistory] = useState([]);
    const [copiedId, setCopied] = useState(null);
    const fileRef = useRef(null);

    useEffect(() => {
        axios.get("/binance/rate").then(r => setUsdtRate(r.data.rate ?? 0)).catch(() => {});
        axios.get("/payment-cards/active").then(r => setCards(r.data)).catch(() => {});
    }, []);
    useEffect(() => {
        axios.get("/manual-topup/my").then(r => setHistory(r.data)).catch(() => {});
    }, [chekOk]);

    const copyCard = (card) => {
        navigator.clipboard.writeText(card.card_number.replace(/\s/g, "")).then(() => {
            setCopied(card.id);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const onFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setChekFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const removeFile = () => {
        setChekFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleClick = async () => {
        const amt = parseFloat(clickAmt);
        if (!amt || amt < 1000) return;
        try {
            setClickLoading(true);
            const r = await axios.post("/payment/create", { order_type: "topup", amount: amt, payment_method: "click" });
            if (r.data.payment_url) window.location.href = r.data.payment_url;
        } catch (e) { alert(e.response?.data?.message ?? "Xatolik"); }
        finally { setClickLoading(false); }
    };

    const handleBinance = async () => {
        const amt = parseFloat(bnbAmt);
        if (!amt || amt < 10000) return;
        try {
            setBnbLoading(true);
            const r = await axios.post("/binance/create", { amount_uzs: amt });
            if (r.data.checkout_url) window.location.href = r.data.checkout_url;
        } catch (e) { alert(e.response?.data?.message ?? "Xatolik"); }
        finally { setBnbLoading(false); }
    };

    const handleChek = async () => {
        if (!chekFile || !chekAmt || parseFloat(chekAmt) < 1000) return;
        try {
            setChekLoading(true);
            const form = new FormData();
            form.append("amount", chekAmt);
            form.append("receipt", chekFile);
            await axios.post("/manual-topup", form, { headers: { "Content-Type": "multipart/form-data" } });
            setChekOk(true);
            setChekAmt("");
            removeFile();
            setTimeout(() => setChekOk(false), 5000);
        } catch (e) { alert(e.response?.data?.message ?? "Xatolik"); }
        finally { setChekLoading(false); }
    };

    const bnbUsdt = usdtRate > 0 && bnbAmt ? (parseFloat(bnbAmt) / usdtRate).toFixed(2) : null;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-10">
            <Head title="Balans to'ldirish" />

            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center gap-3">
                <Link href="/reseller" className="size-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-all">
                    <ArrowLeft className="size-4 text-slate-400" />
                </Link>
                <h1 className="font-bold text-white text-sm">Balans to'ldirish</h1>

                {/* Balance chip */}
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8">
                    <Wallet className="size-3.5 text-violet-400" />
                    <span className="text-xs font-black text-white">{fmt(user?.balance)}</span>
                    <span className="text-[10px] text-slate-600 font-semibold">UZS</span>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">

                {/* Method switcher */}
                <div className="grid grid-cols-3 gap-2">
                    {METHODS.map(m => {
                        const a = ACCENT[m.accent];
                        const active = method === m.key;
                        return (
                            <button
                                key={m.key}
                                onClick={() => setMethod(m.key)}
                                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                    active
                                        ? `${a.tab} bg-white/3`
                                        : "border-white/6 bg-white/2 text-slate-600 hover:text-slate-400 hover:bg-white/4"
                                }`}
                            >
                                {m.key === "binance" && (
                                    <span className={`flex items-center justify-center gap-1 ${active ? "text-yellow-300" : ""}`}>
                                        <BinanceLogo /> Binance
                                    </span>
                                )}
                                {m.key === "click" && (
                                    <span className="flex items-center justify-center">
                                        <img src={ClickLogo} alt="Click" className={`h-3.5 w-auto object-contain ${active ? "" : "opacity-40"}`} />
                                    </span>
                                )}
                                {m.key === "chek" && (
                                    <span className={`flex items-center justify-center gap-1 ${active ? "text-violet-300" : ""}`}>
                                        <Receipt className="size-3" /> Chek
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── BINANCE ── */}
                {method === "binance" && (
                    <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-yellow-400">
                                <BinanceLogo />
                                <span className="font-bold text-sm">Binance Pay</span>
                            </div>
                            {usdtRate > 0 && (
                                <span className="text-[10px] text-slate-600 font-mono bg-white/3 border border-white/6 px-2 py-1 rounded-lg">
                                    1 USDT = {fmt(usdtRate)} UZS
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-600 font-bold uppercase tracking-widest block">Miqdor</label>
                            <div className="relative">
                                <input
                                    type="number" min="10000" placeholder="10 000"
                                    value={bnbAmt} onChange={e => setBnbAmt(e.target.value)}
                                    className={`w-full h-12 bg-white/3 border border-white/8 rounded-xl px-4 pr-16 text-white font-mono text-sm outline-none transition-all placeholder:text-slate-700 ${ac.focus}`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-bold font-mono">UZS</span>
                            </div>
                            {bnbUsdt && (
                                <p className="text-xs font-bold text-yellow-400 px-1">≈ {bnbUsdt} USDT</p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {QUICK.map(a => (
                                <button key={a} onClick={() => setBnbAmt(String(a))}
                                    className={`py-2 rounded-lg text-[11px] font-bold border transition-all ${
                                        bnbAmt === String(a) ? ac.quick : "border-white/6 text-slate-600 hover:text-slate-400 hover:bg-white/3"
                                    }`}
                                >{fmt(a)}</button>
                            ))}
                        </div>

                        {usdtRate === 0 && (
                            <p className="text-xs text-amber-500 bg-amber-500/8 border border-amber-500/15 rounded-xl p-3">
                                USDT kursi belgilanmagan. Admin bilan bog'laning.
                            </p>
                        )}

                        <button
                            onClick={handleBinance}
                            disabled={!bnbAmt || parseFloat(bnbAmt) < 10000 || bnbLoading || usdtRate === 0}
                            className={`w-full h-11 rounded-xl font-bold text-xs disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 ${ac.btn}`}
                        >
                            {bnbLoading
                                ? <><span className="size-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />Yuklanmoqda</>
                                : <><ExternalLink className="size-3.5" />Binance Pay orqali to'lash</>
                            }
                        </button>
                    </div>
                )}

                {/* ── CLICK ── */}
                {method === "click" && (
                    <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                        <img src={ClickLogo} alt="Click" className="h-5 w-auto object-contain" />

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-600 font-bold uppercase tracking-widest block">Miqdor</label>
                            <div className="relative">
                                <input
                                    type="number" min="1000" placeholder="10 000"
                                    value={clickAmt} onChange={e => setClickAmt(e.target.value)}
                                    className="w-full h-12 bg-white/3 border border-white/8 rounded-xl px-4 pr-16 text-white font-mono text-sm outline-none transition-all placeholder:text-slate-700 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-bold font-mono">UZS</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {QUICK.map(a => (
                                <button key={a} onClick={() => setClickAmt(String(a))}
                                    className={`py-2 rounded-lg text-[11px] font-bold border transition-all ${
                                        clickAmt === String(a) ? ACCENT.blue.quick : "border-white/6 text-slate-600 hover:text-slate-400 hover:bg-white/3"
                                    }`}
                                >{fmt(a)}</button>
                            ))}
                        </div>

                        <button
                            onClick={handleClick}
                            disabled={!clickAmt || parseFloat(clickAmt) < 1000 || clickLoading}
                            className="w-full h-11 rounded-xl font-bold text-xs bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {clickLoading
                                ? <><span className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />Yuklanmoqda</>
                                : <><ExternalLink className="size-3.5" />Click orqali to'lash</>
                            }
                        </button>
                    </div>
                )}

                {/* ── CHEK ── */}
                {method === "chek" && (
                    <div className="space-y-3">

                        {/* Card slider */}
                        {cards.length > 0 && (
                            <div className="rounded-2xl border border-white/6 bg-white/2 p-4 space-y-3">
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Karta raqamlari</p>
                                <Swiper
                                    modules={[Pagination, Autoplay]}
                                    slidesPerView={1} loop
                                    autoplay={{ delay: 2800, disableOnInteraction: false }}
                                    pagination={{ clickable: true }}
                                    className="pb-6 h-36"
                                >
                                    {cards.map((card, idx) => (
                                        <SwiperSlide key={card.id}>
                                            <div
                                                className="relative h-full rounded-xl overflow-hidden p-4 flex flex-col justify-between"
                                                style={{ background: CARD_GRADIENTS[idx % CARD_GRADIENTS.length] }}
                                            >
                                                <div className="absolute -right-4 -top-4 size-20 rounded-full bg-white/10 blur-lg" />
                                                <div className="flex items-center justify-between">
                                                    <div className="size-6 rounded-md bg-yellow-200/80 shadow" />
                                                    <span className="text-white/80 text-xs font-bold">{card.bank_name ?? "UZCARD"}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-mono text-base font-bold tracking-widest">{card.card_number}</p>
                                                    <div className="flex items-center justify-between mt-1.5">
                                                        <p className="text-white/50 text-[10px] font-medium uppercase">{card.card_holder ?? "VALLER"}</p>
                                                        <button
                                                            onClick={() => copyCard(card)}
                                                            className="flex items-center gap-1 bg-black/25 hover:bg-black/40 px-2 py-1 rounded-lg text-[10px] font-bold text-white/80 border border-white/10 transition-all"
                                                        >
                                                            {copiedId === card.id
                                                                ? <CheckCircle className="size-3 text-emerald-300" />
                                                                : <Copy className="size-3" />}
                                                            Ko'chirish
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        )}

                        {/* Steps */}
                        <div className="rounded-2xl border border-white/6 bg-white/2 p-4 space-y-4">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Qanday amalga oshirish kerak?</p>
                            <div className="space-y-3">
                                {[
                                    "Yuqoridagi kartaga pul o'tkazing",
                                    "To'lov chekinini (screenshot) oling",
                                    "Quyida miqdor va chekni yuboring — admin tasdiqlaydi",
                                ].map((s, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="size-5 rounded-full bg-violet-500/15 border border-violet-500/20 text-[10px] font-black text-violet-400 flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                                        <p className="text-xs text-slate-400 leading-relaxed">{s}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upload */}
                        <div className="rounded-2xl border border-white/6 bg-white/2 p-4 space-y-4">
                            {!preview ? (
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full h-28 rounded-xl border-2 border-dashed border-white/8 hover:border-violet-500/30 flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-violet-400 transition-all group"
                                >
                                    <div className="size-9 rounded-xl bg-white/3 group-hover:bg-violet-500/10 flex items-center justify-center transition-all">
                                        <Upload className="size-4" />
                                    </div>
                                    <span className="text-xs font-semibold">Chek rasmini yuklang</span>
                                    <span className="text-[10px] text-slate-700">JPG, PNG, WEBP · max 5MB</span>
                                </button>
                            ) : (
                                <div className="relative rounded-xl border border-white/8 bg-white/3 p-2 flex justify-center">
                                    <img src={preview} alt="chek" className="max-h-36 rounded-lg object-contain" />
                                    <button onClick={removeFile} className="absolute top-2 right-2 size-6 bg-rose-500 hover:bg-rose-400 text-white rounded-lg flex items-center justify-center transition-all">
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />

                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-600 font-bold uppercase tracking-widest block">O'tkazilgan miqdor</label>
                                <div className="relative">
                                    <input
                                        type="number" min="1000" placeholder="10 000"
                                        value={chekAmt} onChange={e => setChekAmt(e.target.value)}
                                        className="w-full h-12 bg-white/3 border border-white/8 rounded-xl px-4 pr-16 text-white font-mono text-sm outline-none transition-all placeholder:text-slate-700 focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/20"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-bold font-mono">UZS</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {QUICK.slice(0, 3).map(a => (
                                    <button key={a} onClick={() => setChekAmt(String(a))}
                                        className={`py-2 rounded-lg text-[11px] font-bold border transition-all ${
                                            chekAmt === String(a) ? ACCENT.violet.quick : "border-white/6 text-slate-600 hover:text-slate-400 hover:bg-white/3"
                                        }`}
                                    >{fmt(a)}</button>
                                ))}
                            </div>

                            {chekOk && (
                                <div className="flex items-center gap-2 bg-emerald-400/8 border border-emerald-400/20 rounded-xl p-3 text-xs font-semibold text-emerald-400">
                                    <CheckCircle className="size-4 shrink-0" />
                                    Yuborildi! Admin tez orada ko'rib chiqadi.
                                </div>
                            )}

                            <button
                                onClick={handleChek}
                                disabled={!chekFile || !chekAmt || parseFloat(chekAmt) < 1000 || chekLoading}
                                className="w-full h-11 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {chekLoading
                                    ? <><span className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />Yuklanmoqda</>
                                    : "Chekni yuborish"
                                }
                            </button>
                        </div>

                        {/* History */}
                        {history.length > 0 && (
                            <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                                    <Receipt className="size-3.5 text-slate-600" />
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Chek tarixi</p>
                                </div>
                                <div className="divide-y divide-white/4">
                                    {history.map(r => {
                                        const s = HISTORY_STATUS[r.status] ?? { label: r.status, cls: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
                                        return (
                                            <div key={r.id} className="flex items-center justify-between px-4 py-3">
                                                <div>
                                                    <p className="font-mono font-black text-white text-sm">{fmt(r.amount)} <span className="text-[10px] text-slate-600 font-normal">UZS</span></p>
                                                    <p className="text-[10px] text-slate-700 flex items-center gap-1 mt-0.5">
                                                        <Clock className="size-2.5" />
                                                        {new Date(r.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${s.cls}`}>
                                                    {s.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
