import { Head, router, usePage } from "@inertiajs/react";
import { Bell, CalendarClock, Check, Info, Package } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Notification type → i18n key mapping
function resolveNotification(item, t) {
    const src = item.source;
    const type = item.order_type; // uc | ml | service | null
    const status = item.order_status; // delivered | canceled | paid | approved | rejected | null
    const desc = item.description;

    // ── System (topup) ────────────────────────────────────────────
    if (
        src === "system" ||
        (!type && (status === "approved" || status === "rejected"))
    ) {
        if (status === "approved") {
            return {
                title: t("notifications.topup_approved_title"),
                message: t("notifications.topup_approved_message"),
            };
        }
        if (status === "rejected") {
            return {
                title: t("notifications.topup_rejected_title"),
                message: t("notifications.topup_rejected_message"),
            };
        }
    }

    // ── Order notifications ───────────────────────────────────────
    if (type && status) {
        if (status === "delivered") {
            const titleKey = `notifications.order_delivered_${type}_title`;
            const msgKey = `notifications.order_delivered_${type}_message`;
            return {
                title: t(titleKey, { defaultValue: item.title }),
                message: t(msgKey, { defaultValue: item.message }),
            };
        }
        if (status === "canceled") {
            return {
                title: t("notifications.order_canceled_title"),
                message: desc
                    ? t("notifications.order_canceled_message_with_reason", {
                          reason: desc,
                      })
                    : t("notifications.order_canceled_message"),
            };
        }
        if (status === "paid") {
            return {
                title: t("notifications.order_paid_title"),
                message: t("notifications.order_paid_message"),
            };
        }
    }

    // ── Fallback: broadcast / custom admin message ────────────────
    return { title: item.title, message: item.message };
}

function UserNotifications() {
    const { t } = useTranslation();
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

    // Auto-read unread items sequentially using existing routes to avoid 404 errors
    useEffect(() => {
        const unreadItems = notifications.filter(
            (item) => item.is_read === "unread",
        );

        if (unreadItems.length > 0) {
            unreadItems.forEach((item) => {
                markAsRead(item.id);
            });
        }
    }, []);

    // Polling interval for pulling fresh notifications
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
        <div className="min-h-[calc(100vh-140px)] px-4 py-6 pb-24 lg:pb-8">
            <Head title={t("notifications.page_title")} />

            <div className="max-w-4xl mx-auto">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:text-white">
                        {t("notifications.title")}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {t("notifications.subtitle")}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <Bell className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {stats.total ?? 0}
                            </div>
                            <div className="text-xs sm:text-sm text-blue-100">
                                {t("notifications.stats.total")}
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-violet-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <Info className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {stats.system ?? 0}
                            </div>
                            <div className="text-xs sm:text-sm text-violet-100">
                                {t("notifications.stats.system")}
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex items-center justify-center size-10 sm:size-12 bg-white/20 rounded-xl mb-3 mx-auto">
                            <Package className="size-5 sm:size-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold mb-1">
                                {stats.orders ?? 0}
                            </div>
                            <div className="text-xs sm:text-sm text-emerald-100">
                                {t("notifications.stats.orders")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification cards */}
                <div className="space-y-4">
                    {notifications.map((item) => {
                        const { title, message } = resolveNotification(item, t);
                        const isUnread = item.is_read === "unread";

                        return (
                            <div
                                key={item.id}
                                className={`backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 border
                                    ${
                                        isUnread
                                            ? "bg-blue-50/80 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/40"
                                            : "bg-white/80 dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`p-3 rounded-xl shrink-0 ${
                                            item.order_type
                                                ? "bg-linear-to-br from-emerald-500 to-teal-600"
                                                : "bg-linear-to-br from-blue-600 to-indigo-600"
                                        }`}
                                    >
                                        {item.order_type ? (
                                            <Package className="size-5 text-white" />
                                        ) : (
                                            <Bell className="size-5 text-white" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                                {title}
                                            </h3>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isUnread && (
                                                    <button
                                                        onClick={() =>
                                                            markAsRead(item.id)
                                                        }
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                                                        title={t(
                                                            "notifications.mark_read",
                                                        )}
                                                    >
                                                        <Check className="size-3" />
                                                        {t(
                                                            "notifications.mark_read",
                                                        )}
                                                    </button>
                                                )}
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        isUnread
                                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                                    }`}
                                                >
                                                    {isUnread
                                                        ? t(
                                                              "notifications.status.unread",
                                                          )
                                                        : t(
                                                              "notifications.status.read",
                                                          )}
                                                </span>
                                            </div>
                                        </div>

                                        {message && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                                {message}
                                            </p>
                                        )}

                                        {item.image_url && (
                                            <img
                                                src={item.image_url}
                                                alt=""
                                                className="mt-3 rounded-xl max-h-64 w-full object-cover border border-slate-100 dark:border-slate-700"
                                            />
                                        )}

                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1.5">
                                            <CalendarClock className="size-3.5 shrink-0" />
                                            {formatDateTime(item.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {notifications.length === 0 && (
                    <div className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-slate-100 dark:border-slate-700">
                        <div className="bg-slate-100 dark:bg-slate-700 size-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="size-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {t("notifications.empty_title")}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {t("notifications.empty_desc")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserNotifications;
