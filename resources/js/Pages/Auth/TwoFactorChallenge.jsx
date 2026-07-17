import Logo from "@images/vg.png";
import { Head, useForm } from "@inertiajs/react";
import { KeyRound, Loader } from "lucide-react";

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({ code: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/2fa/challenge");
    };

    return (
        <>
            <Head title="2FA Tasdiqlash" />

            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
                <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 space-y-6">
                    <div className="flex flex-col items-center gap-3">
                        <img src={Logo} alt="Logo" className="w-14 h-14 object-contain" />
                        <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Ikki faktorli tasdiqlash
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Authenticator ilovasidagi 6 raqamli kodni kiriting
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                                TOTP kodi
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                autoFocus
                                value={data.code}
                                onChange={(e) =>
                                    setData("code", e.target.value.replace(/\D/g, "").slice(0, 6))
                                }
                                placeholder="000000"
                                className={`w-full px-4 py-3 rounded-xl text-center font-mono text-2xl tracking-[0.4em] border outline-none transition-all
                                    bg-white dark:bg-slate-900
                                    text-slate-900 dark:text-white
                                    ${errors.code
                                        ? "border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-400/20"
                                        : "border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    }`}
                            />
                            {errors.code && (
                                <p className="mt-1.5 text-xs text-rose-500">{errors.code}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || data.code.length !== 6}
                            className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader className="size-4 animate-spin" />
                                    Tekshirilmoqda...
                                </>
                            ) : (
                                "Tasdiqlash"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                        Kirish uchun{" "}
                        <a href="/login" className="text-violet-500 hover:underline">
                            boshidan boshlash
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
