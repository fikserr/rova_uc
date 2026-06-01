import { Head, useForm, usePage } from "@inertiajs/react";
import { CheckCircle, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";

function PasswordInput({ label, id, value, onChange, error }) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <label
                htmlFor={id}
                className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm border outline-none transition-all
                        bg-white dark:bg-slate-800
                        border-slate-200 dark:border-slate-700
                        text-slate-900 dark:text-white
                        placeholder-slate-400
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}

function PasswordStrength({ password }) {
    const calc = (p) => {
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[a-z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^a-zA-Z0-9]/.test(p)) s++;
        return s;
    };
    const strength = calc(password);
    const colors = ["bg-red-500", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
    const labels = ["Juda zaif", "Zaif", "O'rtacha", "Kuchli"];

    if (!password) return null;

    return (
        <div className="space-y-1.5 mt-2">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                            i < strength ? colors[strength - 1] : "bg-slate-200 dark:bg-slate-700"
                        }`}
                    />
                ))}
            </div>
            {strength > 0 && (
                <p className={`text-xs font-medium ${colors[strength - 1].replace("bg-", "text-")}`}>
                    {labels[strength - 1]}
                </p>
            )}
        </div>
    );
}

export default function AdminSecurity({ hasPassword }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const setForm = useForm({
        password: "",
        password_confirmation: "",
    });

    const changeForm = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const handleSet = (e) => {
        e.preventDefault();
        setForm.post("/admin/security/password", {
            onSuccess: () => setForm.reset(),
        });
    };

    const handleChange = (e) => {
        e.preventDefault();
        changeForm.put("/admin/security/password", {
            onSuccess: () => changeForm.reset(),
        });
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 p-0">
            <Head title="Admin — Xavfsizlik" />

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                    <ShieldCheck className="size-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                        Xavfsizlik
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Admin akkaunt paroli boshqaruvi
                    </p>
                </div>
            </div>

            {/* Flash success */}
            {flash.success && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        {flash.success}
                    </p>
                </div>
            )}

            {/* Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <KeyRound className="size-4 text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {hasPassword ? "Parolni o'zgartirish" : "Parol o'rnatish"}
                    </h2>
                </div>

                <div className="p-6">
                    {!hasPassword ? (
                        /* ── Set password form ── */
                        <form onSubmit={handleSet} className="space-y-4">
                            <PasswordInput
                                label="Yangi parol"
                                id="set-password"
                                value={setForm.data.password}
                                onChange={(e) => setForm.setData("password", e.target.value)}
                                error={setForm.errors.password}
                            />
                            <PasswordStrength password={setForm.data.password} />

                            <PasswordInput
                                label="Parolni tasdiqlang"
                                id="set-password-confirm"
                                value={setForm.data.password_confirmation}
                                onChange={(e) => setForm.setData("password_confirmation", e.target.value)}
                                error={setForm.errors.password_confirmation}
                            />

                            <button
                                type="submit"
                                disabled={setForm.processing}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                            >
                                {setForm.processing ? "Saqlanmoqda..." : "Parolni o'rnatish"}
                            </button>
                        </form>
                    ) : (
                        /* ── Change password form ── */
                        <form onSubmit={handleChange} className="space-y-4">
                            <PasswordInput
                                label="Joriy parol"
                                id="current-password"
                                value={changeForm.data.current_password}
                                onChange={(e) => changeForm.setData("current_password", e.target.value)}
                                error={changeForm.errors.current_password}
                            />

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                <PasswordInput
                                    label="Yangi parol"
                                    id="new-password"
                                    value={changeForm.data.password}
                                    onChange={(e) => changeForm.setData("password", e.target.value)}
                                    error={changeForm.errors.password}
                                />
                                <PasswordStrength password={changeForm.data.password} />
                            </div>

                            <PasswordInput
                                label="Yangi parolni tasdiqlang"
                                id="new-password-confirm"
                                value={changeForm.data.password_confirmation}
                                onChange={(e) => changeForm.setData("password_confirmation", e.target.value)}
                                error={changeForm.errors.password_confirmation}
                            />

                            <button
                                type="submit"
                                disabled={changeForm.processing}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                            >
                                {changeForm.processing ? "Saqlanmoqda..." : "Parolni yangilash"}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Info note */}
            <p className="text-xs text-slate-400 dark:text-slate-600 text-center px-4">
                Parol kamida 8 ta belgi bo'lishi va login sahifasida ishlatilishi kerak.
            </p>
        </div>
    );
}
