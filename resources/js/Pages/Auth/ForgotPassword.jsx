import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Mail, Loader, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/forgot-password', {
            onSuccess: () => setSubmitted(true),
        });
    };

    return (
        <>
            <Head title="Forgot Password" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo/Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg mb-4">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
                        <p className="text-gray-600 mt-2">No worries, we'll help you reset it</p>
                    </div>

                    {submitted ? (
                        <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-4">
                            <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
                            <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
                            <p className="text-gray-600">
                                We've sent a password reset link to <span className="font-medium">{data.email}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                If you don't see it, check your spam folder or try a different email address.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {status && (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-700">{status}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                                <p className="text-gray-600 text-sm">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>

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
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition ${
                                                errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    {processing && <Loader className="w-5 h-5 animate-spin" />}
                                    {processing ? 'Sending...' : 'Send Reset Link'}
                                </button>

                                {/* Back to Login */}
                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to login
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
