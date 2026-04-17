import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { CheckCircle, Clock, CreditCard, Receipt, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STATUS_LABEL = {
    pending:  { text: "Ko'rib chiqilmoqda", cls: "bg-amber-100 text-amber-700" },
    approved: { text: "Tasdiqlandi",         cls: "bg-emerald-100 text-emerald-700" },
    rejected: { text: "Rad etildi",          cls: "bg-rose-100 text-rose-700" },
};

function UserBalance() {
    const { user } = usePage().props;

    // ── Click to'lov ─────────────────────────────────────────────
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [amount, setAmount]                 = useState("");
    const [loading, setLoading]               = useState(false);

    // ── Chek to'lov ──────────────────────────────────────────────
    const [checkAmount, setCheckAmount]   = useState("");
    const [receiptFile, setReceiptFile]   = useState(null);
    const [preview, setPreview]           = useState(null);
    const [checkLoading, setCheckLoading] = useState(false);
    const [checkSuccess, setCheckSuccess] = useState(false);
    const [myRequests, setMyRequests]     = useState([]);
    const fileInputRef = useRef(null);

    const quickAmounts = [10000, 30000, 50000, 100000, 200000, 500000];

    const paymentMethods = [
        { id: "click",  label: "Click / Payme", icon: "🇺🇿", desc: "Karta orqali" },
        { id: "manual", label: "Chek / Bank o'tkazma", icon: "🧾", desc: "Chek rasmini yuborish" },
    ];

    useEffect(() => {
        axios.get("/manual-topup/my")
            .then(res => setMyRequests(res.data))
            .catch(() => {});
    }, [checkSuccess]);

    // ── Click to'lov ─────────────────────────────────────────────
    const handleClickPay = async () => {
        if (!amount) return;
        try {
            setLoading(true);
            const res = await axios.post("/payment/create", {
                telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
                amount,
            });
            if (res.data.payment_url) {
                window.location.href = res.data.payment_url;
            }
        } catch {
            alert("To'lov yaratishda xatolik");
        } finally {
            setLoading(false);
        }
    };

    // ── Chek upload ───────────────────────────────────────────────
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
        if (!receiptFile || !checkAmount || parseFloat(checkAmount) < 1000) return;
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
            alert(e.response?.data?.message ?? "Xatolik yuz berdi");
        } finally {
            setCheckLoading(false);
        }
    };

    const checkDisabled = !receiptFile || !checkAmount || parseFloat(checkAmount) < 1000 || checkLoading;

    return (
        <>
            <Head title="Hisobni to'ldirish" />

            <div className="min-h-[calc(100vh-140px)] px-4 py-6 pb-24 lg:pb-8 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
                <div className="max-w-2xl mx-auto space-y-5">

                    {/* Balans kartasi */}
                    <div className="rounded-3xl shadow-xl p-6 bg-white dark:bg-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Joriy balans</p>
                                <p className="text-4xl font-bold text-blue-600 mt-1">
                                    {Number(user?.balance ?? 0).toLocaleString("fr-FR")} UZS
                                </p>
                            </div>
                            <div className="bg-blue-600 p-4 rounded-2xl">
                                <CreditCard className="size-10 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* To'lov usulini tanlash */}
                    <div>
                        <h2 className="text-base font-bold text-slate-700 dark:text-white mb-3">
                            To'lov usulini tanlang
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {paymentMethods.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMethod(m.id)}
                                    className={`rounded-2xl p-4 border-2 text-left transition-all ${
                                        selectedMethod === m.id
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    }`}
                                >
                                    <div className="text-3xl mb-2">{m.icon}</div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{m.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Click to'lov ─────────────────────────────── */}
                    {selectedMethod === "click" && (
                        <div className="rounded-2xl shadow p-5 bg-white dark:bg-slate-800">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Summani kiriting</h3>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setAmount(String(amt))}
                                        className={`py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                                            amount === String(amt)
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white hover:border-blue-300"
                                        }`}
                                    >
                                        {Number(amt).toLocaleString("fr-FR")}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="number"
                                min="1000"
                                placeholder="Summa (so'm)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-14 text-xl w-full border-b-2 outline-none bg-transparent dark:text-white dark:border-slate-500 mb-4"
                            />

                            <button
                                onClick={handleClickPay}
                                disabled={!amount || parseFloat(amount) < 1 || loading}
                                className="w-full h-12 font-bold bg-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Yuklanmoqda..." : `${Number(amount || 0).toLocaleString("fr-FR")} UZS to'lash`}
                            </button>
                        </div>
                    )}

                    {/* ── Chek orqali to'lov ────────────────────────── */}
                    {selectedMethod === "manual" && (
                        <div className="rounded-2xl shadow p-5 bg-white dark:bg-slate-800 space-y-4">
                            <h3 className="font-bold text-slate-800 dark:text-white">Chek orqali to'ldirish</h3>

                            <ol className="text-sm text-slate-500 dark:text-slate-400 space-y-1 list-decimal list-inside">
                                <li>Bank orqali pul o'tkazing</li>
                                <li>Chek rasmini yuklang</li>
                                <li>Summani kiriting va yuboring</li>
                            </ol>

                            {/* Rasm yuklash */}
                            {!preview ? (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl h-36 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                >
                                    <Upload className="size-8" />
                                    <span className="text-sm font-medium">Chek rasmini tanlang</span>
                                    <span className="text-xs">JPG, PNG, WEBP — maks 10MB</span>
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
                                        className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600"
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

                            {/* Summa */}
                            <div>
                                <label className="text-sm text-slate-500 dark:text-slate-400 mb-1 block">
                                    O'tkazilgan summa (so'm)
                                </label>
                                <input
                                    type="number"
                                    min="1000"
                                    placeholder="50000"
                                    value={checkAmount}
                                    onChange={(e) => setCheckAmount(e.target.value)}
                                    className="w-full h-12 border-b-2 border-slate-300 dark:border-slate-500 outline-none bg-transparent text-xl dark:text-white"
                                />
                            </div>

                            {checkSuccess && (
                                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl p-3 text-sm font-medium">
                                    <CheckCircle className="size-5 shrink-0" />
                                    Chekingiz yuborildi! Ko'rib chiqilgandan so'ng balansingizga qo'shiladi.
                                </div>
                            )}

                            <button
                                onClick={handleCheckSubmit}
                                disabled={checkDisabled}
                                className="w-full h-12 font-bold bg-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {checkLoading ? "Yuborilmoqda..." : "Chekni yuborish"}
                            </button>
                        </div>
                    )}

                    {/* ── So'rovlar tarixi ──────────────────────────── */}
                    {myRequests.length > 0 && (
                        <div className="rounded-2xl shadow p-5 bg-white dark:bg-slate-800">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                <Receipt className="size-5" /> So'rovlar tarixi
                            </h3>
                            <div className="space-y-2">
                                {myRequests.map((r) => {
                                    const s = STATUS_LABEL[r.status] ?? { text: r.status, cls: "bg-slate-100 text-slate-600" };
                                    return (
                                        <div key={r.id} className="flex items-center justify-between py-2 border-b dark:border-slate-700 last:border-0">
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                                    {Number(r.amount).toLocaleString("fr-FR")} UZS
                                                </p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Clock className="size-3" />
                                                    {new Date(r.created_at).toLocaleString("ru-RU")}
                                                </p>
                                                {r.notes && (
                                                    <p className="text-xs text-rose-500 mt-0.5">{r.notes}</p>
                                                )}
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.cls}`}>
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
