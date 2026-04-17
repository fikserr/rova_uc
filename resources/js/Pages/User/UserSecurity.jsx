import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import {
    CheckCircle,
    Eye,
    EyeOff,
    Key,
    Lock,
    Shield,
    XCircle,
} from "lucide-react";

function UserSecurity() {

    const { auth, flash, errors } = usePage().props;
    const user = auth?.user;

    const userId = user?.id;
    const hasPassword = !!user?.hasPassword;

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Password strength
    const getPasswordStrength = (pass) => {
        if (!pass) return 0;

        let strength = 0;

        if (pass.length >= 8) strength++;
        if (/[a-z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^a-zA-Z0-9]/.test(pass)) strength++;

        return strength;
    };

    const strength = getPasswordStrength(newPassword);

    const strengthColors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-lime-500",
        "bg-green-500",
    ];

    const handleSubmit = (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const payload = {
            password: newPassword
        };

        if (hasPassword) {
            payload.current_password = currentPassword;
        }

        if (hasPassword) {

            router.put(`/password/${userId}`, payload, {
                preserveScroll: true,

                onSuccess: () => {
                    setSuccess("Password updated successfully!");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                },

                onError: (errors) => {
                    setError(
                        errors.current_password ||
                        errors.password ||
                        "Xatolik yuz berdi"
                    );
                }
            });

        } else {

            router.post("/password", payload, {
                preserveScroll: true,

                onSuccess: () => {
                    setSuccess("Password created successfully!");
                    setNewPassword("");
                    setConfirmPassword("");
                },

                onError: (errors) => {
                    setError(
                        errors.current_password ||
                        errors.password ||
                        "Xatolik yuz berdi"
                    );
                }
            });

        }

    };

    if (!user) return null;
    const successMessage = success || flash?.success;
    const errorMessage = error || errors?.current_password || errors?.password;
    
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

            <div className="w-full max-w-md">

                {/* Header */}

                <div className="text-center mb-8">

                    <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        {hasPassword ? "Change Password" : "Set Password"}
                    </h1>

                    <p className="text-sm text-gray-600 mt-2">
                        {hasPassword
                            ? "Enter your current password and choose a new password."
                            : "Choose a strong password to secure your account."}
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >

                    <div className="p-6 space-y-6">

                        {/* CURRENT PASSWORD */}

                        {hasPassword && (
                            <div className="space-y-2">

                                <label className="block text-sm font-medium text-gray-700">
                                    Current Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrent(!showCurrent)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showCurrent
                                            ? <EyeOff className="w-5 h-5"/>
                                            : <Eye className="w-5 h-5"/>
                                        }
                                    </button>

                                </div>

                            </div>
                        )}

                        {/* NEW PASSWORD */}

                        <div className="space-y-2">

                            <label className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>

                            <div className="relative">

                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNew(!showNew)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showNew
                                        ? <EyeOff className="w-5 h-5"/>
                                        : <Eye className="w-5 h-5"/>
                                    }
                                </button>

                            </div>

                            {newPassword && (
                                <div className="space-y-2">

                                    <div className="flex gap-1 h-1.5">

                                        {[...Array(4)].map((_, i) => (

                                            <div
                                                key={i}
                                                className={`flex-1 rounded-full ${
                                                    i < strength
                                                        ? strengthColors[strength-1]
                                                        : "bg-gray-200"
                                                }`}
                                            />

                                        ))}

                                    </div>

                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Key className="w-3 h-3"/>
                                        {["Very Weak","Weak","Fair","Good","Strong"][strength]} password
                                    </p>

                                </div>
                            )}

                        </div>

                        {/* CONFIRM PASSWORD */}

                        <div className="space-y-2">

                            <label className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>

                            <div className="relative">

                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirm(!showConfirm)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showConfirm
                                        ? <EyeOff className="w-5 h-5"/>
                                        : <Eye className="w-5 h-5"/>
                                    }
                                </button>

                            </div>

                            {confirmPassword && (
                                <p className={`text-xs flex items-center gap-1 ${
                                    newPassword === confirmPassword
                                        ? "text-green-600"
                                        : "text-red-500"
                                }`}>
                                    {newPassword === confirmPassword
                                        ? <><CheckCircle className="w-4 h-4"/>Passwords match</>
                                        : <><XCircle className="w-4 h-4"/>Passwords don't match</>
                                    }
                                </p>
                            )}

                        </div>

                        {errorMessage && (
                            <p className="text-red-500 text-sm">
                                {errorMessage}
                            </p>
                        )}

                        {successMessage && (
                            <p className="text-green-600 text-sm">
                                {successMessage}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            {hasPassword
                                ? "Update Password"
                                : "Save Password"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default UserSecurity;
