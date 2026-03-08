import { useState } from "react";
import { usePage } from "@inertiajs/react";
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
    const { user } = usePage().props; // get user from Inertia
    const userId = user.id;
    const hasPassword = !!user.password; // true if user already has a password

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    console.log(userId);
    console.log(hasPassword);
    console.log(currentPassword);
    console.log(newPassword);
    console.log(confirmPassword);


    // Password strength calculation
    const getPasswordStrength = (pass) => {
        if (!pass) return 0;
        let strength = 0;
        if (pass.length >= 8) strength += 1;
        if (pass.match(/[a-z]/)) strength += 1;
        if (pass.match(/[0-9]/)) strength += 1;
        if (pass.match(/[^a-zA-Z0-9]/)) strength += 1;
        return strength;
    };

    const strength = getPasswordStrength(newPassword);
    const strengthColors = ["bg-red-500","bg-orange-500","bg-lime-500","bg-green-500"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const url = hasPassword ? `/password/${userId}` : "/password";
            const method = hasPassword ? "PUT" : "POST";

            const payload = { password: newPassword };
            if (hasPassword) payload.current_password = currentPassword; // optional backend validation

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Something went wrong.");
                return;
            }

            setSuccess(hasPassword ? "Password updated successfully!" : "Password created successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error(err);
            setError("Something went wrong.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{hasPassword ? "Change Password" : "Set Password"}</h1>
                    <p className="text-sm text-gray-600 mt-2">
                        {hasPassword
                            ? "Enter your current password and choose a new password."
                            : "Choose a strong password to secure your account."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 space-y-6">

                        {/* CURRENT PASSWORD (only for existing users) */}
                        {hasPassword && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-50 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showCurrent ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* NEW PASSWORD */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showNew ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>

                            {/* Password strength */}
                            {newPassword && (
                                <div className="space-y-2">
                                    <div className="flex gap-1 h-1.5">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-full transition-all duration-300 ${
                                                    i < strength ? strengthColors[strength-1] : "bg-gray-200"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-medium flex items-center gap-1 ${strength > 3 ? "text-green-600" : "text-gray-500"}`}>
                                        <Key className="w-3 h-3"/>
                                        {["Very Weak","Weak","Fair","Good","Strong"][strength]} password
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>

                            {confirmPassword && (
                                <p className={`text-xs flex items-center gap-1 ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                                    {newPassword === confirmPassword
                                        ? <><CheckCircle className="w-4 h-4"/>Passwords match</>
                                        : <><XCircle className="w-4 h-4"/>Passwords don't match</>
                                    }
                                </p>
                            )}
                        </div>

                        {/* Password requirements */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <Shield className="w-3 h-3"/>
                                Password requirements:
                            </p>
                            <ul className="space-y-1 text-xs text-gray-600">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className={`w-4 h-4 ${newPassword.length >= 8 ? "text-green-500":"text-gray-400"}`}/>At least 8 characters
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className={`w-4 h-4 ${/[a-z]/.test(newPassword) ? "text-green-500":"text-gray-400"}`}/>One lowercase letter
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className={`w-4 h-4 ${/[0-9]/.test(newPassword) ? "text-green-500":"text-gray-400"}`}/>One number
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className={`w-4 h-4 ${/[^a-zA-Z0-9]/.test(newPassword) ? "text-green-500":"text-gray-400"}`}/>One special character
                                </li>
                            </ul>
                        </div>

                        {/* Error / Success messages */}
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {success && <p className="text-green-600 text-sm">{success}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {hasPassword ? "Update Password" : "Save Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserSecurity;
