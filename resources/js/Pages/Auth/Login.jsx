import Logo from "@images/vg.png";
import { Head, Link, useForm } from "@inertiajs/react";
import { Eye, EyeOff, Loader, Lock, Mail } from "lucide-react";
import { useState } from "react";
export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors } = useForm({
        username: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        post("/login");
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen flex">
                {/* Left Panel — Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0f] flex-col items-center justify-center p-12">
                    {/* Animated grid background */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)",
                            backgroundSize: "48px 48px",
                        }}
                    />
                    {/* Glowing orbs */}
                    <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-600 opacity-20 blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-500 opacity-15 blur-[100px]" />

                    {/* Content */}
                    <div className="relative z-10 text-center space-y-6 max-w-sm">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="w-26 h-26 mx-auto object-contain"
                        />
                        <div>
                            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                                Welcome back
                            </h2>
                            <p className="mt-3 text-indigo-300 text-base leading-relaxed">
                                Sign in to access your dashboard and manage
                                everything in one place.
                            </p>
                        </div>
                        {/* Decorative feature tags */}
                        <div className="flex flex-wrap gap-2 justify-center pt-2">
                            {[
                                "Fast & Secure",
                                "Real-time Updates",
                                "Always On",
                            ].map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-indigo-200 border border-white/10 backdrop-blur-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel — Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#0d0d14] px-6 py-12">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="flex lg:hidden justify-center mb-8">
                            <img
                                src={Logo}
                                alt="Logo"
                                className="w-16 h-16 object-contain"
                            />
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Sign in
                            </h1>
                            <p className="mt-1 text-sm text-gray-400">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Sign up for free
                                </Link>
                            </p>
                        </div>

                        {/* Status */}
                        {status && (
                            <div className="mb-5 p-4 rounded-xl bg-emerald-900/30 border border-emerald-700">
                                <p className="text-sm text-emerald-300">
                                    {status}
                                </p>
                            </div>
                        )}

                        {/* Card */}
                        <div className="bg-white/5 rounded-2xl shadow-xl shadow-black/30 border border-white/10 p-8 space-y-5">
                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-semibold text-gray-300 mb-2"
                                >
                                    Telegram Username
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="@yourusername"
                                        value={data.username}
                                        onChange={(event) =>
                                            setData(
                                                "username",
                                                event.target.value,
                                            )
                                        }
                                        className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border rounded-xl outline-none transition-all
                                            placeholder:text-gray-500
                                            text-white
                                            focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                                            ${
                                                errors.username
                                                    ? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
                                                    : "border-white/10 hover:border-white/20"
                                            }`}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-semibold text-gray-300"
                                    >
                                        Password
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs font-medium  text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        id="password"
                                        placeholder="Enter your password"
                                        value={data.password}
                                        onChange={(event) =>
                                            setData(
                                                "password",
                                                event.target.value,
                                            )
                                        }
                                        className={`w-full pl-10 pr-11 py-2.5 text-sm bg-white/5 border rounded-xl outline-none transition-all
                                            placeholder:text-gray-500
                                            text-white
                                            focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                                            ${
                                                errors.password
                                                    ? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
                                                    : "border-white/10 hover:border-white/20"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((value) => !value)
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4.5 h-4.5" />
                                        ) : (
                                            <Eye className="w-4.5 h-4.5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(event) =>
                                                setData(
                                                    "remember",
                                                    event.target.checked,
                                                )
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-4.5 h-4.5 rounded border-2 border-gray-600 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                                            {data.remember && (
                                                <svg
                                                    className="w-2.5 h-2.5 text-white"
                                                    fill="none"
                                                    viewBox="0 0 12 9"
                                                >
                                                    <path
                                                        d="M1 4.5L4.5 8 11 1"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                                        Remember me for 30 days
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98]"
                            >
                                {processing && (
                                    <Loader className="w-4 h-4 animate-spin" />
                                )}
                                {processing ? "Signing in…" : "Sign In"}
                            </button>
                        </div>

                        {/* Footer */}
                        <p className="mt-6 text-center text-xs text-gray-500">
                            By signing in, you agree to our{" "}
                            <a
                                href="#"
                                className="underline underline-offset-2 hover:text-gray-300 transition-colors"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                href="#"
                                className="underline underline-offset-2 hover:text-gray-300 transition-colors"
                            >
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
