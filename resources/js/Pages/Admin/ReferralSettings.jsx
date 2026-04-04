import { Head, useForm, usePage } from "@inertiajs/react";

export default function ReferralSettings() {
    const { setting, stats, flash } = usePage().props;

    const { data, setData, post, processing } = useForm({
        reward_amount: setting?.reward_amount ?? 0,
        is_active: Boolean(setting?.is_active ?? true),
    });

    const submit = (e) => {
        e.preventDefault();
        post("/referral-settings");
    };

    return (
        <div className="space-y-6">
            <Head title="Referral Settings" />

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Referral Settings</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    Har bir taklif qilingan do'st uchun bonus summasini belgilang
                </p>
            </div>

            {flash?.success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                    {flash.success}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-slate-400">Jami referral</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                        {Number(stats?.total_referrals ?? 0).toLocaleString("fr-FR")}
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-slate-400">Jami berilgan bonus</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                        {Number(stats?.total_rewarded ?? 0).toLocaleString("fr-FR")} UZS
                    </p>
                </div>
            </div>

            <form
                onSubmit={submit}
                className="max-w-xl rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Bonus summasi (UZS)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.reward_amount}
                        onChange={(e) => setData("reward_amount", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200"
                        required
                    />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                        className="rounded border-gray-300 dark:border-slate-700 dark:bg-slate-950 text-blue-600 focus:ring-blue-500"
                    />
                    Referral bonus tizimi faol
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                    {processing ? "Saqlanmoqda..." : "Saqlash"}
                </button>
            </form>
        </div>
    );
}

