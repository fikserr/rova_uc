import { Head, router, useForm, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    CheckCircle, Copy, Eye, EyeOff, KeyRound,
    Mail, QrCode, Shield, ShieldCheck, ShieldOff, XCircle,
} from "lucide-react";
import { useState } from "react";

/* ── shared ──────────────────────────────────────────────── */
function Flash() {
    const { flash = {}, errors = {} } = usePage().props;
    const success = flash?.success;
    const error   = flash?.error;
    const first   = Object.values(errors)[0];
    const msg     = success || error || first;
    if (!msg) return null;
    const ok = !!success;
    return (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${ok
            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
            : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
        }`}>
            {ok ? <CheckCircle className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
            {msg}
        </div>
    );
}

function PasswordInput({ label, id, value, onChange, error }) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm border outline-none transition-all bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>
    );
}

function PasswordStrength({ password }) {
    if (!password) return null;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    const colors = ["bg-red-500", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
    const labels = ["Juda zaif", "Zaif", "O'rtacha", "Kuchli"];
    return (
        <div className="space-y-1.5 mt-2">
            <div className="flex gap-1">
                {[0,1,2,3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < s ? colors[s-1] : "bg-slate-200 dark:bg-slate-700"}`} />
                ))}
            </div>
            {s > 0 && <p className={`text-xs font-medium ${colors[s-1].replace("bg-","text-")}`}>{labels[s-1]}</p>}
        </div>
    );
}

/* ── TAB 1: Parol ────────────────────────────────────────── */
function PasswordTab({ hasPassword }) {
    const setForm    = useForm({ password: "", password_confirmation: "" });
    const changeForm = useForm({ current_password: "", password: "", password_confirmation: "" });

    return (
        <div className="space-y-4">
            <Flash />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <KeyRound className="size-4 text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {hasPassword ? "Parolni o'zgartirish" : "Parol o'rnatish"}
                    </h2>
                </div>
                <div className="p-6">
                    {!hasPassword ? (
                        <form onSubmit={e => { e.preventDefault(); setForm.post("/admin/security/password", { onSuccess: () => setForm.reset() }); }} className="space-y-4">
                            <PasswordInput label="Yangi parol" id="set-pw" value={setForm.data.password}
                                onChange={e => setForm.setData("password", e.target.value)} error={setForm.errors.password} />
                            <PasswordStrength password={setForm.data.password} />
                            <PasswordInput label="Parolni tasdiqlang" id="set-pw-c" value={setForm.data.password_confirmation}
                                onChange={e => setForm.setData("password_confirmation", e.target.value)} error={setForm.errors.password_confirmation} />
                            <button type="submit" disabled={setForm.processing}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {setForm.processing ? "Saqlanmoqda..." : "Parolni o'rnatish"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={e => { e.preventDefault(); changeForm.put("/admin/security/password", { onSuccess: () => changeForm.reset() }); }} className="space-y-4">
                            <PasswordInput label="Joriy parol" id="cur-pw" value={changeForm.data.current_password}
                                onChange={e => changeForm.setData("current_password", e.target.value)} error={changeForm.errors.current_password} />
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                <PasswordInput label="Yangi parol" id="new-pw" value={changeForm.data.password}
                                    onChange={e => changeForm.setData("password", e.target.value)} error={changeForm.errors.password} />
                                <PasswordStrength password={changeForm.data.password} />
                            </div>
                            <PasswordInput label="Yangi parolni tasdiqlang" id="new-pw-c" value={changeForm.data.password_confirmation}
                                onChange={e => changeForm.setData("password_confirmation", e.target.value)} error={changeForm.errors.password_confirmation} />
                            <button type="submit" disabled={changeForm.processing}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {changeForm.processing ? "Saqlanmoqda..." : "Parolni yangilash"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-600 text-center px-4">
                Parol kamida 8 ta belgi bo'lishi kerak.
            </p>
        </div>
    );
}

/* ── TAB 2: Email ────────────────────────────────────────── */
function EmailTab({ userEmail, emailVerifiedAt }) {
    const [email,   setEmail]   = useState("");
    const [code,    setCode]    = useState("");
    const [step,    setStep]    = useState("input"); // input | verify
    const [msg,     setMsg]     = useState(null);    // {type:'ok'|'err', text}
    const [loading, setLoading] = useState(false);

    const showMsg = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg(null), 4000);
    };

    const sendCode = async () => {
        if (!email.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post("/email/send-code", { email: email.trim() });
            showMsg("ok", res.data.message);
            setStep("verify");
        } catch (e) {
            showMsg("err", e.response?.data?.message || "Xatolik");
        } finally { setLoading(false); }
    };

    const verify = async () => {
        if (code.length !== 6) return;
        setLoading(true);
        try {
            const res = await axios.post("/email/verify", { code });
            showMsg("ok", res.data.message);
            setStep("input");
            setEmail("");
            setCode("");
            router.reload({ only: [] });
        } catch (e) {
            showMsg("err", e.response?.data?.message || "Xatolik");
        } finally { setLoading(false); }
    };

    const removeEmail = async () => {
        if (!confirm("Emailni o'chirishni tasdiqlaysizmi?")) return;
        setLoading(true);
        try {
            const res = await axios.delete("/email");
            showMsg("ok", res.data.message);
            router.reload({ only: [] });
        } catch { showMsg("err", "Xatolik"); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            {msg && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${msg.type === "ok"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
                }`}>
                    {msg.type === "ok" ? <CheckCircle className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
                    {msg.text}
                </div>
            )}

            {/* Current email status */}
            {userEmail && (
                <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${emailVerifiedAt
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                }`}>
                    <div className="flex items-center gap-2 min-w-0">
                        <Mail className={`size-4 shrink-0 ${emailVerifiedAt ? "text-emerald-600" : "text-amber-600"}`} />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{userEmail}</p>
                            <p className={`text-xs ${emailVerifiedAt ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                {emailVerifiedAt ? "Tasdiqlangan ✓" : "Tasdiqlanmagan"}
                            </p>
                        </div>
                    </div>
                    <button onClick={removeEmail} disabled={loading}
                        className="shrink-0 text-xs px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors">
                        O'chirish
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <Mail className="size-4 text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {userEmail ? "Emailni yangilash" : "Email qo'shish"}
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    {step === "input" ? (
                        <>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    Email manzil
                                </label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <button onClick={sendCode} disabled={loading || !email.trim()}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? "Yuborilmoqda..." : "Tasdiqlash kodi yuborish"}
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span> manziliga 6 raqamli kod yuborildi.
                            </p>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    Tasdiqlash kodi
                                </label>
                                <input type="text" inputMode="numeric" maxLength={6} value={code}
                                    onChange={e => setCode(e.target.value.replace(/\D/g,"").slice(0,6))}
                                    placeholder="000000"
                                    className="w-full px-4 py-3 rounded-xl text-center font-mono text-2xl tracking-[0.4em] border outline-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={verify} disabled={loading || code.length !== 6}
                                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                    {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
                                </button>
                                <button onClick={() => { setStep("input"); setCode(""); }}
                                    className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    Orqaga
                                </button>
                            </div>
                            <button onClick={sendCode} disabled={loading}
                                className="w-full text-xs text-slate-400 hover:text-blue-500 transition-colors">
                                Kodni qayta yuborish
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── TAB 3: 2FA ──────────────────────────────────────────── */
function TwoFaTab({ hasSecret, isEnabled, qrUrl }) {
    const { errors = {} } = usePage().props;
    const [code, setCode] = useState("");
    const [copied, setCopied] = useState(false);

    const secret = qrUrl ? new URLSearchParams(qrUrl.split("?")[1]).get("secret") : null;

    const copySecret = async () => {
        if (!secret) return;
        await navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generate  = () => router.post("/2fa/generate", {}, { preserveScroll: true });
    const enable    = (e) => { e.preventDefault(); router.post("/2fa/enable",  { code }, { preserveScroll: true, onSuccess: () => setCode("") }); };
    const disable   = (e) => { e.preventDefault(); router.post("/2fa/disable", { code }, { preserveScroll: true, onSuccess: () => setCode("") }); };

    return (
        <div className="space-y-4">
            <Flash />

            {/* Status */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isEnabled
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
            }`}>
                {isEnabled
                    ? <Shield className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    : <ShieldOff className="size-5 text-slate-400 shrink-0" />}
                <div>
                    <p className={`text-sm font-semibold ${isEnabled ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>
                        2FA {isEnabled ? "yoqilgan" : "o'chirilgan"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isEnabled ? "Har kirganingizda TOTP kodi talab qilinadi." : "2FA hozirda faol emas."}
                    </p>
                </div>
            </div>

            {/* No secret */}
            {!hasSecret && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <QrCode className="size-5 text-violet-500" />
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">2FA ni sozlash</h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Telefondagi authenticator ilovasi uchun maxfiy kalit yarating.
                    </p>
                    <button onClick={generate}
                        className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors">
                        Maxfiy kalit yaratish
                    </button>
                </div>
            )}

            {/* Has secret, not enabled */}
            {hasSecret && !isEnabled && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <QrCode className="size-5 text-violet-500" />
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Authenticator ni sozlang</h2>
                    </div>
                    <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                        <li>Google Authenticator yoki Authy ilovasini oching.</li>
                        <li>QR kodni skanerlang yoki maxfiy kalitni qo'lda kiriting.</li>
                        <li>Ilovadagi 6 raqamli kodni quyida kiriting.</li>
                    </ol>
                    {/* QR */}
                    {qrUrl && (
                        <div className="space-y-3">
                            <div className="flex justify-center">
                                <div className="p-3 bg-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm inline-flex">
                                    <img src={`https://chart.googleapis.com/chart?chs=180x180&chld=M|0&cht=qr&chl=${encodeURIComponent(qrUrl)}`}
                                        alt="QR kod" width={180} height={180} className="rounded-lg"
                                        onError={e => { e.currentTarget.style.display = "none"; }} />
                                </div>
                            </div>
                            {secret && (
                                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Maxfiy kalit</p>
                                    <div className="flex items-center gap-2 justify-between">
                                        <code className="font-mono text-lg font-bold text-violet-600 dark:text-violet-400 tracking-widest break-all">{secret}</code>
                                        <button type="button" onClick={copySecret}
                                            className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            {copied ? <CheckCircle className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <form onSubmit={enable} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">6-raqamli TOTP kodi</label>
                            <input type="text" inputMode="numeric" maxLength={6} value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g,"").slice(0,6))}
                                placeholder="000000"
                                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-center font-mono text-2xl tracking-[0.4em] bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${errors.code ? "border-rose-400 focus:ring-2 focus:ring-rose-400/20" : "border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"}`} />
                            {errors.code && <p className="text-xs text-rose-500">{errors.code}</p>}
                        </div>
                        <button type="submit" disabled={code.length !== 6}
                            className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            2FA ni yoqish
                        </button>
                    </form>
                    <div className="text-center border-t dark:border-slate-700 pt-3">
                        <button type="button" onClick={generate}
                            className="text-xs text-slate-400 hover:text-violet-500 transition-colors">
                            Yangi kalit yaratish
                        </button>
                    </div>
                </div>
            )}

            {/* Enabled — allow disable */}
            {hasSecret && isEnabled && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <ShieldOff className="size-5 text-rose-500" />
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">2FA ni o'chirish</h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">2FA ni o'chirish uchun hozirgi TOTP kodingizni kiriting.</p>
                    <form onSubmit={disable} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">6-raqamli TOTP kodi</label>
                            <input type="text" inputMode="numeric" maxLength={6} value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g,"").slice(0,6))}
                                placeholder="000000"
                                className="w-full px-4 py-3 rounded-xl border outline-none transition-all text-center font-mono text-2xl tracking-[0.4em] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" />
                            {errors.code && <p className="text-xs text-rose-500">{errors.code}</p>}
                        </div>
                        <button type="submit" disabled={code.length !== 6}
                            className="w-full py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            2FA ni o'chirish
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Eslatma</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                    Maxfiy kalitni xavfsiz joyda saqlang. Telefon yo'qolsa, kirish imkoni cheklanadi.
                </p>
            </div>
        </div>
    );
}

/* ── Main ────────────────────────────────────────────────── */
const TABS = [
    { id: "password", label: "Parol",   icon: KeyRound  },
    { id: "email",    label: "Email",   icon: Mail      },
    { id: "2fa",      label: "2FA",     icon: Shield    },
];

export default function AdminSecurity() {
    const { hasPassword, userEmail, emailVerifiedAt, hasSecret, isEnabled, qrUrl } = usePage().props;
    const [tab, setTab] = useState("password");

    return (
        <div className="max-w-xl mx-auto space-y-6 p-0">
            <Head title="Xavfsizlik" />

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                    <ShieldCheck className="size-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">Xavfsizlik</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Akkaunt himoyasi sozlamalari</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                {TABS.map(t => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${active
                                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}>
                            <Icon className="size-4" />
                            {t.label}
                            {t.id === "email" && userEmail && (
                                <span className={`size-1.5 rounded-full ${emailVerifiedAt ? "bg-emerald-500" : "bg-amber-500"}`} />
                            )}
                            {t.id === "2fa" && isEnabled && (
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {tab === "password" && <PasswordTab hasPassword={hasPassword} />}
            {tab === "email"    && <EmailTab userEmail={userEmail} emailVerifiedAt={emailVerifiedAt} />}
            {tab === "2fa"      && <TwoFaTab hasSecret={hasSecret} isEnabled={isEnabled} qrUrl={qrUrl} />}
        </div>
    );
}
