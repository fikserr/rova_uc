import { Head, router, usePage } from "@inertiajs/react";
import { CheckCircle, Eye, EyeOff, Key, Lock, XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// ─── Password Strength ───────────────────────────────────────────────────────

const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[a-z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^a-zA-Z0-9]/.test(pass)) s++;
    return s;
};

const strengthColors = [
    "bg-red-500",
    "bg-orange-400",
    "bg-amber-400",
    "bg-emerald-500",
];

// ─── Password Input ──────────────────────────────────────────────────────────

function PasswordInput({ label, value, onChange, show, onToggle, dark }) {
    return (
        <div className="space-y-1.5">
            <label
                className={`block text-xs font-semibold uppercase tracking-widest ${
                    dark ? "text-slate-400" : "text-slate-500"
                }`}
            >
                {label}
            </label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-3 pr-12 rounded-xl text-sm border outline-none transition-all duration-200 ${
                        dark
                            ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    }`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                        dark
                            ? "text-slate-500 hover:text-slate-300"
                            : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                    {show ? (
                        <EyeOff className="w-4 h-4" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

function UserSecurity() {
    const { auth, flash, errors } = usePage().props;
    const { t, i18n } = useTranslation();

    const user = auth?.user;
    const userId = user?.id;
    const hasPassword = !!user?.hasPassword;

    const [dark, setDark] = useState(
        () => localStorage.getItem("theme") === "dark",
    );

    const toggleDark = () => {
        const next = !dark;
        setDark(next);
        localStorage.setItem("theme", next ? "dark" : "light");
    };

    const changeLang = (lang) => {
        i18n.changeLanguage(lang);
    };

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const strength = getPasswordStrength(newPassword);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError(t("security.passwords_dont_match"));
            return;
        }

        const payload = { password: newPassword };
        if (hasPassword) payload.current_password = currentPassword;

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setSuccess(
                    hasPassword
                        ? t("security.success_update")
                        : t("security.success_create"),
                );
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => {
                    router.visit("/user-services");
                }, 500);
            },
            onError: (errs) => {
                setError(
                    errs.current_password ||
                        errs.password ||
                        t("security.generic_error"),
                );
            },
        };

        if (hasPassword) {
            router.put(`/password/${userId}`, payload, options);
        } else {
            router.post("/password", payload, options);
        }
    };

    if (!user) return null;

    const successMessage = success || flash?.success;
    const errorMessage = error || errors?.current_password || errors?.password;

    return (
        <>
            <Head title={t("security.page_title")} />

            <div
                className={`h-[85vh] flex items-center justify-center p-4 transition-colors duration-300 ${
                    dark
                        ? "bg-slate-950"
                        : "bg-linear-to-br from-slate-100 via-slate-50 to-indigo-50"
                }`}
            >
                {/* Decorative blobs – light mode only */}
                {!dark && (
                    <>
                        <div className="pointer-events-none fixed -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-200/40 blur-3xl" />
                        <div className="pointer-events-none fixed -bottom-15 -right-15 w-64 h-64 rounded-full bg-violet-200/30 blur-3xl" />
                    </>
                )}

                <div className="w-full max-w-sm relative z-10">
                    {/* Top bar */}

                    {/* Card */}
                    <div
                        className={`rounded-2xl overflow-hidden transition-colors duration-300 ${
                            dark
                                ? "bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40"
                                : "bg-white border border-slate-100 shadow-xl shadow-slate-200/60"
                        }`}
                    >
                        {/* Accent bar */}
                        <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500" />

                        <div className="p-7 space-y-6">
                            {/* Header */}
                            <div className="flex items-start gap-4">
                                <div
                                    className={`p-2.5 rounded-xl shrink-0 ${
                                        dark
                                            ? "bg-indigo-600/20"
                                            : "bg-indigo-50"
                                    }`}
                                >
                                    <Lock
                                        className={`w-5 h-5 ${
                                            dark
                                                ? "text-indigo-400"
                                                : "text-indigo-600"
                                        }`}
                                    />
                                </div>
                                <div>
                                    <h1
                                        className={`text-lg font-bold leading-tight ${
                                            dark
                                                ? "text-white"
                                                : "text-slate-900"
                                        }`}
                                    >
                                        {hasPassword
                                            ? t("security.change_password")
                                            : t("security.set_password")}
                                    </h1>
                                    <p
                                        className={`text-xs mt-0.5 leading-relaxed ${
                                            dark
                                                ? "text-slate-400"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {hasPassword
                                            ? t("security.change_subtitle")
                                            : t("security.set_subtitle")}
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div
                                className={`h-px ${
                                    dark ? "bg-slate-800" : "bg-slate-100"
                                }`}
                            />

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {hasPassword && (
                                    <PasswordInput
                                        label={t("security.current_password")}
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        show={showCurrent}
                                        onToggle={() =>
                                            setShowCurrent(!showCurrent)
                                        }
                                        dark={dark}
                                    />
                                )}

                                {/* New password + strength meter */}
                                <div className="space-y-2">
                                    <PasswordInput
                                        label={t("security.new_password")}
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        show={showNew}
                                        onToggle={() => setShowNew(!showNew)}
                                        dark={dark}
                                    />

                                    {newPassword && (
                                        <div className="space-y-1.5 px-0.5">
                                            <div className="flex gap-1 h-1">
                                                {[...Array(4)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 rounded-full transition-all duration-300 ${
                                                            i < strength
                                                                ? strengthColors[
                                                                      strength -
                                                                          1
                                                                  ]
                                                                : dark
                                                                  ? "bg-slate-700"
                                                                  : "bg-slate-200"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p
                                                className={`text-xs flex items-center gap-1 ${
                                                    dark
                                                        ? "text-slate-500"
                                                        : "text-slate-400"
                                                }`}
                                            >
                                                <Key className="w-3 h-3" />
                                                {t(
                                                    `security.strength_${strength || 1}`,
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div className="space-y-1.5">
                                    <PasswordInput
                                        label={t("security.confirm_password")}
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        show={showConfirm}
                                        onToggle={() =>
                                            setShowConfirm(!showConfirm)
                                        }
                                        dark={dark}
                                    />

                                    {confirmPassword && (
                                        <p
                                            className={`text-xs flex items-center gap-1 px-0.5 ${
                                                newPassword === confirmPassword
                                                    ? "text-emerald-500"
                                                    : "text-red-500"
                                            }`}
                                        >
                                            {newPassword === confirmPassword ? (
                                                <>
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    {t(
                                                        "security.passwords_match",
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    {t(
                                                        "security.passwords_dont_match",
                                                    )}
                                                </>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Error message */}
                                {errorMessage && (
                                    <div
                                        className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                                            dark
                                                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                                : "bg-red-50 border border-red-100 text-red-600"
                                        }`}
                                    >
                                        <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Success message */}
                                {successMessage && (
                                    <div
                                        className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                                            dark
                                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                                : "bg-emerald-50 border border-emerald-100 text-emerald-600"
                                        }`}
                                    >
                                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        {successMessage}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white
                                        bg-linear-to-r from-indigo-500 to-violet-600
                                        hover:from-indigo-600 hover:to-violet-700
                                        active:scale-[0.98] transition-all duration-150
                                        shadow-md shadow-indigo-500/25"
                                >
                                    {hasPassword
                                        ? t("security.update_password")
                                        : t("security.save_password")}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserSecurity;
