import { Head, router, usePage } from "@inertiajs/react";
import { Bell, CalendarClock, Check, Info, Package } from "lucide-react";
import { useEffect } from "react";

function UserNotifications() {
    const { notifications = [], stats = {} } = usePage().props;

    const markAsRead = (id) => {
        router.patch(
            `/user-notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["notifications", "stats"],
            },
        );
    };

    useEffect(() => {
        const refreshNotifications = () => {
            router.reload({
                only: ["notifications", "stats"],
                preserveScroll: true,
                preserveState: true,
            });
        };

        const intervalId = setInterval(refreshNotifications, 5000);
        window.addEventListener("focus", refreshNotifications);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("focus", refreshNotifications);
        };
    }, []);

    const formatDateTime = (value) => {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);

        return date.toLocaleString("uz-UZ");
    };

    return (
        <div className="min-h-[calc(100vh-140px)] bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 px-4 py-6 pb-24 lg:pb-8">
            <Head title="Bildirishnomalar" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:text-white">
                        Bildirishnomalar
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Sizga kelgan barcha xabarlar va yangiliklar
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <Bell className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.total ?? 0}</div>
                            <div className="text-xs sm:text-sm text-blue-100">Jami xabar</div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-violet-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <Info className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.system ?? 0}</div>
                            <div className="text-xs sm:text-sm text-violet-100">Tizim xabarlari</div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <Package className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.orders ?? 0}</div>
                            <div className="text-xs sm:text-sm text-emerald-100">Buyurtma yangiliklari</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-2xl shadow-md dark:text-white hover:shadow-lg transition-shadow p-5 sm:p-6 border border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shrink-0">
                                    {item.source === "admin" ? (
                                        <Package className="size-5 text-white" />
                                    ) : (
                                        <Bell className="size-5 text-white" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {item.status === "unread" && (
                                                <button
                                                    onClick={() => markAsRead(item.id)}
                                                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                                                    title="O'qilgan deb belgilash"
                                                >
                                                    <Check className="size-3" />
                                                    O'qildi
                                                </button>
                                            )}
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    item.status === "unread"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {item.status === "unread" ? "Yangi" : "Ko'rilgan"}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                        {item.message}
                                    </p>
                                    {item.description ? (
                                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                                            Sabab: {item.description}
                                        </p>
                                    ) : null}
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-2">
                                        <CalendarClock className="size-3.5" />
                                        {formatDateTime(item.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {notifications.length === 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                        <div className="bg-slate-100 size-20 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-slate-700">
                            <Bell className="size-10 text-slate-400 dark:text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">
                            Hozircha bildirishnoma yo'q
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            Yangi holatlar bo'lsa shu yerda ko'rinadi
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserNotifications;
