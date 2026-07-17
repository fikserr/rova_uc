import { Head, router, usePage } from "@inertiajs/react";
import { CheckCircle, Copy, KeyRound, QrCode, Shield, ShieldOff, XCircle } from "lucide-react";
import { useState } from "react";

/* ── helpers ─────────────────────────────────────────────── */

function Flash() {
    const { flash = {}, errors = {} } = usePage().props;
    const codeErr = errors?.code;
    const success  = flash?.success;
    const error    = flash?.error;

    if (!success && !error && !codeErr) return null;

    const isOk  = !!success;
    const text  = success || error || codeErr;

    return (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
            isOk
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
        }`}>
            {isOk
                ? <CheckCircle className="w-4 h-4 shrink-0" />
                : <XCircle className="w-4 h-4 shrink-0" />}
            {text}
        </div>
    );
}

function CodeInput({ value, onChange, error }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                6-raqamli TOTP kodi
            </label>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all text-center font-mono text-2xl tracking-[0.4em]
                    bg-white dark:bg-slate-800
                    text-slate-900 dark:text-white
                    ${error
                        ? "border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-400/20"
                        : "border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    }`}
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}

/* ── QR section ──────────────────────────────────────────── */

function QrSection({ qrUrl }) {
    const [copied, setCopied] = useState(false);

    const copyUrl = async () => {
        if (!qrUrl) return;
        await navigator.clipboard.writeText(qrUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Extract secret from the otpauth URL for display
    const secret = qrUrl
        ? new URLSearchParams(qrUrl.split("?")[1]).get("secret")
        : null;

    return (
        <div className="space-y-4">
            {/* QR image via Google Charts (requires internet; gracefully hides on error) */}
            <div className="flex justify-center">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm inline-flex">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&ecc=M&data=${encodeURIComponent(qrUrl)}`}
                        alt="QR kod"
                        width={200}
                        height={200}
                        className="rounded-lg"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                </div>
            </div>

            {/* Secret key */}
            {secret && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        Maxfiy kalit (qo'lda kiriting)
                    </p>
                    <div className="flex items-center gap-2 justify-between">
                        <code className="font-mono text-lg font-bold text-violet-600 dark:text-violet-400 tracking-widest break-all">
                            {secret}
                        </code>
                        <button
                            type="button"
                            onClick={copyUrl}
                            title="Nusxa olish"
                            className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        Google Authenticator, Authy yoki boshqa TOTP ilovasiga qo'shing.
                    </p>
                </div>
            )}
        </div>
    );
}

/* ── Main page ────────────────────────────────────────────── */

export default function TwoFactorSetup() {
    const { hasSecret, isEnabled, qrUrl } = usePage().props;
    const { errors = {} }                 = usePage().props;

    const [code, setCode] = useState("");

    const handleGenerate = () => {
        router.post("/2fa/generate", {}, { preserveScroll: true });
    };

    const handleEnable = (e) => {
        e.preventDefault();
        router.post("/2fa/enable", { code }, {
            preserveScroll: true,
            onSuccess: () => setCode(""),
        });
    };

    const handleDisable = (e) => {
        e.preventDefault();
        router.post("/2fa/disable", { code }, {
            preserveScroll: true,
            onSuccess: () => setCode(""),
        });
    };

    return (
        <>
            <Head title="2FA Sozlamalari" />

            <div className="max-w-lg mx-auto space-y-6 py-6 px-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Ikki faktorli autentifikatsiya
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Hisobingizni qo'shimcha himoya qiling
                        </p>
                    </div>
                </div>

                <Flash />

                {/* Status card */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                    isEnabled
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                }`}>
                    {isEnabled
                        ? <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        : <ShieldOff className="w-5 h-5 text-slate-400 shrink-0" />}
                    <div>
                        <p className={`text-sm font-semibold ${isEnabled ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>
                            2FA {isEnabled ? "yoqilgan" : "o'chirilgan"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isEnabled
                                ? "Har kirganingizda TOTP kodi talab qilinadi."
                                : "2FA hozirda faol emas."}
                        </p>
                    </div>
                </div>

                {/* ── No secret yet ── */}
                {!hasSecret && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-violet-500" />
                            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                                2FA ni sozlash
                            </h2>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Telefondagi authenticator ilovasi uchun maxfiy kalit yarating.
                            Keyin kodni kiritib 2FA ni faollashtiring.
                        </p>
                        <button
                            onClick={handleGenerate}
                            className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                        >
                            Maxfiy kalit yaratish
                        </button>
                    </div>
                )}

                {/* ── Has secret, not enabled ── */}
                {hasSecret && !isEnabled && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-violet-500" />
                            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                                Authenticator ilovasini sozlang
                            </h2>
                        </div>

                        <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                            <li>Google Authenticator yoki Authy ilovasini oching.</li>
                            <li>QR kodni skanerlang yoki maxfiy kalitni qo'lda kiriting.</li>
                            <li>Ilovada ko'rsatilgan 6 raqamli kodni quyida kiriting.</li>
                        </ol>

                        <QrSection qrUrl={qrUrl} />

                        <form onSubmit={handleEnable} className="space-y-4">
                            <CodeInput
                                value={code}
                                onChange={setCode}
                                error={errors.code}
                            />
                            <button
                                type="submit"
                                disabled={code.length !== 6}
                                className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                2FA ni yoqish
                            </button>
                        </form>

                        {/* Re-generate option */}
                        <div className="text-center pt-1 border-t dark:border-slate-700">
                            <button
                                type="button"
                                onClick={handleGenerate}
                                className="text-xs text-slate-400 hover:text-violet-500 transition-colors"
                            >
                                Yangi kalit yaratish
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Has secret, enabled — allow disable ── */}
                {hasSecret && isEnabled && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <ShieldOff className="w-5 h-5 text-rose-500" />
                            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                                2FA ni o'chirish
                            </h2>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            2FA ni o'chirish uchun hozirgi TOTP kodingizni kiriting.
                        </p>
                        <form onSubmit={handleDisable} className="space-y-4">
                            <CodeInput
                                value={code}
                                onChange={setCode}
                                error={errors.code}
                            />
                            <button
                                type="submit"
                                disabled={code.length !== 6}
                                className="w-full py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                2FA ni o'chirish
                            </button>
                        </form>

                        {/* Show QR again for reference */}
                        <details className="group">
                            <summary className="cursor-pointer text-xs text-slate-400 hover:text-violet-500 transition-colors select-none">
                                QR kodni qayta ko'rish
                            </summary>
                            <div className="mt-3">
                                <QrSection qrUrl={qrUrl} />
                            </div>
                        </details>
                    </div>
                )}

                {/* Info box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Eslatma</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        2FA yo'qolsa yoki telefon almashtirilsa, tizimga kirish imkoni cheklandi.
                        Maxfiy kalitni xavfsiz joyda saqlang.
                    </p>
                </div>
            </div>
        </>
    );
}
