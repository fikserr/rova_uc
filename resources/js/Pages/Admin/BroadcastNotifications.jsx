import { Head, useForm, usePage } from "@inertiajs/react";

export default function BroadcastNotifications() {
    const { flash, stats = {} } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({
        title: "",
        message: "",
        description: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/broadcast-notifications", {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Broadcast Notifications" />

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    Broadcast Notifications
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    Barcha userlarga tizim xabari yuborish
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-slate-400">Qabul qiluvchilar</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                    {Number(stats.users_count ?? 0).toLocaleString("fr-FR")} user
                </p>
            </div>

            {flash?.success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                    {flash.success}
                </div>
            )}

            {flash?.error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
                    {flash.error}
                </div>
            )}

            <form
                onSubmit={submit}
                className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Sarlavha
                    </label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200"
                        placeholder="Masalan: Texnik yangilanish"
                        required
                    />
                    {errors.title ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
                    ) : null}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Xabar
                    </label>
                    <textarea
                        value={data.message}
                        onChange={(e) => setData("message", e.target.value)}
                        className="w-full min-h-28 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200"
                        placeholder="Barcha userlarga boradigan asosiy matn"
                        required
                    />
                    {errors.message ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.message}</p>
                    ) : null}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Qo'shimcha izoh (ixtiyoriy)
                    </label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        className="w-full min-h-20 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200"
                        placeholder="Masalan: 15 daqiqa ichida xizmat tiklanadi"
                    />
                    {errors.description ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
                    ) : null}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                    {processing ? "Yuborilmoqda..." : "Broadcast yuborish"}
                </button>
            </form>
        </div>
    );
}

