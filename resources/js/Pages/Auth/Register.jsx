import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Mail, Lock, User, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        agree_terms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    const passwordStrength = (password) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return strength;
    };

    const strength = passwordStrength(data.password);
    const strengthColor = {
        0: 'bg-gray-200',
        1: 'bg-red-500',
        2: 'bg-orange-500',
        3: 'bg-yellow-500',
        4: 'bg-green-500',
    };

    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo/Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg mb-4">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                        <p className="text-gray-600 mt-2">Join us and get started today</p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-5">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="John Doe"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {data.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full ${
                                                    i < strength ? strengthColor[strength] : 'bg-gray-200'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {strength === 0 && 'Password strength: Very Weak'}
                                        {strength === 1 && 'Password strength: Weak'}
                                        {strength === 2 && 'Password strength: Fair'}
                                        {strength === 3 && 'Password strength: Good'}
                                        {strength === 4 && 'Password strength: Strong'}
                                    </p>
                                </div>
                            )}
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="password_confirmation"
                                    placeholder="••••••••"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                                        errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                            )}
                        </div>

                        {/* Terms & Conditions */}
                        <div>
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.agree_terms}
                                    onChange={(e) => setData('agree_terms', e.target.checked)}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                                />
                                <span className="text-sm text-gray-600">
                                    I agree to the{' '}
                                    <a href="#" className="text-green-600 hover:text-green-700 font-medium">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-green-600 hover:text-green-700 font-medium">Privacy Policy</a>
                                </span>
                            </label>
                            {errors.agree_terms && (
                                <p className="mt-1 text-sm text-red-600">{errors.agree_terms}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing || !data.agree_terms}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {processing && <Loader className="w-5 h-5 animate-spin" />}
                            {processing ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-green-600 hover:text-green-700 font-semibold"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
