import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    CheckCircle,
    Eye,
    EyeOff,
    Key,
    Lock,
    Mail,
    Trash2,
    XCircle,
} from "lucide-react";
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
        <div className="space-y-2">
            <label
                className={`block text-sm font-medium ${dark ? "text-slate-200" : "text-slate-700"}`}
            >
                {label}
            </label>
            <div className="relative group">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-3 pr-12 text-sm rounded-lg border outline-none transition-all duration-200 ${
                        dark
                            ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                    }`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                        dark
                            ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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

// ─── Email Section ───────────────────────────────────────────────────────────

function EmailSection({ user, dark }) {
    const email = user?.email ?? "";
    const isVerified = !!user?.email_verified_at;
    const { t } = useTranslation();

    const [step, setStep] = useState("idle");
    const [inputEmail, setInput] = useState(email);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const sendCode = async () => {
        if (!inputEmail) return;
        setLoading(true);
        setMsg(null);
        try {
            await axios.post("/email/send-code", { email: inputEmail });
            setMsg({ type: "ok", text: t("security.password_sent_to_email") });
            setStep("enter_code");
        } catch (e) {
            setMsg({
                type: "err",
                text: e.response?.data?.message ?? t("security.generic_error"),
            });
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async () => {
        if (code.length !== 6) return;
        setLoading(true);
        setMsg(null);
        try {
            await axios.post("/email/verify", { code });
            setMsg({ type: "ok", text: t("security.verified_success") });
            setStep("idle");
            setCode("");
            router.reload({ only: ["auth"] });
        } catch (e) {
            setMsg({
                type: "err",
                text: e.response?.data?.message ?? t("security.verify_error"),
            });
        } finally {
            setLoading(false);
        }
    };

    const removeEmail = async () => {
        if (!confirm(t("security.confirm_delete_email"))) return;
        setLoading(true);
        setMsg(null);
        try {
            await axios.delete("/email");
            setMsg({ type: "ok", text: t("security.email_deleted") });
            setStep("idle");
            router.reload({ only: ["auth"] });
        } catch {
            setMsg({ type: "err", text: t("security.error_email") });
        } finally {
            setLoading(false);
        }
    };

    const inputCls = `w-full px-4 py-3 rounded-lg text-sm border outline-none transition-all duration-200 ${
        dark
            ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
    }`;

    return (
        <div
            className={`rounded-xl overflow-hidden transition-colors duration-300 ${
                dark
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-white border border-slate-200"
            }`}
        >
            <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div
                        className={`p-2.5 rounded-lg shrink-0 ${dark ? "bg-blue-600/20" : "bg-blue-50"}`}
                    >
                        <Mail
                            className={`w-5 h-5 ${dark ? "text-blue-400" : "text-blue-600"}`}
                        />
                    </div>
                    <div>
                        <h2
                            className={`text-base font-semibold ${dark ? "text-white" : "text-slate-900"}`}
                        >
                            {t("security.email_location")}
                        </h2>
                        <p
                            className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}
                        >
                            {t("security.for_restoring_notifies")}
                        </p>
                    </div>
                </div>

                {/* Current email status */}
                {email && (
                    <div
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg ${
                            dark ? "bg-slate-700/50" : "bg-slate-50"
                        }`}
                    >
                        <div className="min-w-0">
                            <p
                                className={`text-sm font-medium truncate ${dark ? "text-white" : "text-slate-800"}`}
                            >
                                {email}
                            </p>
                            <p
                                className={`text-xs mt-1 font-medium ${isVerified ? "text-emerald-500" : "text-amber-500"}`}
                            >
                                {isVerified
                                    ? t("security.email_verified")
                                    : t("security.email_not_verified")}
                            </p>
                        </div>
                        <button
                            onClick={removeEmail}
                            disabled={loading}
                            className={`shrink-0 p-2 rounded-lg transition-colors ${
                                dark
                                    ? "text-red-400 hover:bg-red-900/20"
                                    : "text-red-500 hover:bg-red-50"
                            }`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Messages */}
                {msg && (
                    <div
                        className={`flex items-start gap-2.5 p-3.5 rounded-lg text-xs font-medium ${
                            msg.type === "ok"
                                ? dark
                                    ? "bg-emerald-900/20 border border-emerald-700/30 text-emerald-400"
                                    : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                : dark
                                  ? "bg-red-900/20 border border-red-700/30 text-red-400"
                                  : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                    >
                        {msg.type === "ok" ? (
                            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        ) : (
                            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        )}
                        <span>{msg.text}</span>
                    </div>
                )}

                {/* Step: idle */}
                {step === "idle" && (
                    <button
                        onClick={() => {
                            setStep("enter_email");
                            setInput(email);
                            setMsg(null);
                        }}
                        className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
                            dark
                                ? "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                : "bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        } active:scale-[0.98]`}
                    >
                        {email
                            ? t("security.change_email")
                            : t("security.add_email")}
                    </button>
                )}

                {/* Step: enter email */}
                {step === "enter_email" && (
                    <div className="space-y-3">
                        <div>
                            <label
                                className={`block text-sm font-medium mb-2 ${dark ? "text-slate-200" : "text-slate-700"}`}
                            >
                                {t("security.email_location")}
                            </label>
                            <input
                                type="email"
                                value={inputEmail}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="example@gmail.com"
                                className={inputCls}
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setStep("idle");
                                    setMsg(null);
                                }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                    dark
                                        ? "border border-slate-700 text-slate-300 hover:bg-slate-700"
                                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                {t("security.cancel")}
                            </button>
                            <button
                                onClick={sendCode}
                                disabled={loading || !inputEmail}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading
                                    ? t("security.sending")
                                    : t("security.send_code")}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: enter code */}
                {step === "enter_code" && (
                    <div className="space-y-3">
                        <div>
                            <label
                                className={`block text-sm font-medium mb-2 ${dark ? "text-slate-200" : "text-slate-700"}`}
                            >
                                {t("security.verification_code")}
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(e) =>
                                    setCode(e.target.value.replace(/\D/g, ""))
                                }
                                placeholder="000000"
                                className={`${inputCls} text-center text-2xl font-mono tracking-widest`}
                                autoFocus
                            />
                            <p
                                className={`text-xs mt-2 ${dark ? "text-slate-400" : "text-slate-500"}`}
                            >
                                {t("security.code_sent_to")}{" "}
                                <span className="font-semibold">
                                    {inputEmail}
                                </span>{" "}
                                {t("security.code_sent_to_email")}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setStep("enter_email");
                                    setCode("");
                                    setMsg(null);
                                }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                    dark
                                        ? "border border-slate-700 text-slate-300 hover:bg-slate-700"
                                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                {t("security.back")}
                            </button>
                            <button
                                onClick={verifyCode}
                                disabled={loading || code.length !== 6}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading
                                    ? t("security.verifying")
                                    : t("security.verify_code")}
                            </button>
                        </div>
                        <button
                            onClick={sendCode}
                            disabled={loading}
                            className={`w-full text-xs font-medium transition-colors ${
                                dark
                                    ? "text-slate-500 hover:text-slate-300"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            {t("security.resend_code")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

function UserSecurity() {
    const { auth, flash, errors } = usePage().props;
    const { t } = useTranslation();

    const user = auth?.user;
    const userId = user?.id;
    const hasPassword = !!user?.hasPassword;

    const [dark, setDark] = useState(
        () => localStorage.getItem("theme") === "dark",
    );

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const strength = getPasswordStrength(newPassword);
    const passwordsMatch = confirmPassword && newPassword === confirmPassword;

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
                className={`min-h-screen flex items-center justify-center p-4 pt-10 transition-colors duration-300 ${
                    dark
                        ? "bg-slate-950"
                        : "bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100"
                }`}
            >
                <div className="w-full max-w-md space-y-5">
                    {/* Email Section */}
                    <EmailSection user={user} dark={dark} />

                    {/* Password Card */}
                    <div
                        className={`rounded-xl overflow-hidden transition-colors duration-300 ${
                            dark
                                ? "bg-slate-800 border border-slate-700"
                                : "bg-white border border-slate-200"
                        }`}
                    >
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-start gap-3">
                                <div
                                    className={`p-2.5 rounded-lg shrink-0 ${
                                        dark
                                            ? "bg-indigo-600/20"
                                            : "bg-indigo-50"
                                    }`}
                                >
                                    <Lock
                                        className={`w-5 h-5 ${dark ? "text-indigo-400" : "text-indigo-600"}`}
                                    />
                                </div>
                                <div>
                                    <h1
                                        className={`text-base font-semibold ${dark ? "text-white" : "text-slate-900"}`}
                                    >
                                        {hasPassword
                                            ? t("security.change_password")
                                            : t("security.set_password")}
                                    </h1>
                                    <p
                                        className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}
                                    >
                                        {hasPassword
                                            ? t("security.change_subtitle")
                                            : t("security.set_subtitle")}
                                    </p>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
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
                                <div className="space-y-2.5">
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
                                        <div className="space-y-2">
                                            <div className="flex gap-1.5 h-1.5">
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
                                                className={`text-xs font-medium flex items-center gap-1.5 ${
                                                    strength === 4
                                                        ? dark
                                                            ? "text-emerald-400"
                                                            : "text-emerald-600"
                                                        : strength === 3
                                                          ? dark
                                                              ? "text-amber-400"
                                                              : "text-amber-600"
                                                          : strength === 2
                                                            ? dark
                                                                ? "text-orange-400"
                                                                : "text-orange-600"
                                                            : dark
                                                              ? "text-red-400"
                                                              : "text-red-600"
                                                }`}
                                            >
                                                <Key className="w-3.5 h-3.5" />
                                                {strength > 0
                                                    ? t(
                                                          `security.strength_${strength}`,
                                                      )
                                                    : t(
                                                          "security.add_characters",
                                                      )}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div className="space-y-2.5">
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
                                            className={`text-xs font-medium flex items-center gap-1.5 ${
                                                passwordsMatch
                                                    ? dark
                                                        ? "text-emerald-400"
                                                        : "text-emerald-600"
                                                    : dark
                                                      ? "text-red-400"
                                                      : "text-red-600"
                                            }`}
                                        >
                                            {passwordsMatch ? (
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
                                        className={`flex items-start gap-2.5 p-3.5 rounded-lg text-xs font-medium ${
                                            dark
                                                ? "bg-red-900/20 border border-red-700/30 text-red-400"
                                                : "bg-red-50 border border-red-200 text-red-700"
                                        }`}
                                    >
                                        <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Success message */}
                                {successMessage && (
                                    <div
                                        className={`flex items-start gap-2.5 p-3.5 rounded-lg text-xs font-medium ${
                                            dark
                                                ? "bg-emerald-900/20 border border-emerald-700/30 text-emerald-400"
                                                : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                        }`}
                                    >
                                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        {successMessage}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] ${
                                        dark
                                            ? "bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                                            : "bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                                    }`}
                                >
                                    {hasPassword
                                        ? t("security.update_password")
                                        : t("security.save_password")}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Footer hint */}
                    <p
                        className={`text-center text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}
                    >
                        {t("security.security_footer")}
                    </p>
                </div>
            </div>
        </>
    );
}

export default UserSecurity;
