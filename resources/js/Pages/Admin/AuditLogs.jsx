import { Head, usePage } from "@inertiajs/react";
import {
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Search,
} from "lucide-react";
import { useState, useMemo } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(val) {
    if (!val) return "—";
    return new Date(val).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function JsonBlock({ data }) {
    if (!data) return <span className="text-slate-400 italic text-xs">null</span>;
    return (
        <pre className="text-xs font-mono whitespace-pre-wrap break-all bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-700/40">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
}

const ACTION_COLORS = {
    create:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    update:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    delete:   "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    login:    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    logout:   "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    toggle:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    approve:  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    reject:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function actionColor(action) {
    const key = Object.keys(ACTION_COLORS).find((k) =>
        action?.toLowerCase().includes(k)
    );
    return key ? ACTION_COLORS[key] : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
}

// ── Row component ─────────────────────────────────────────────────────────────

function LogRow({ log }) {
    const [expanded, setExpanded] = useState(false);
    const hasDetails = log.old_values || log.new_values;

    return (
        <>
            <tr
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer"
                onClick={() => hasDetails && setExpanded((v) => !v)}
            >
                {/* ID */}
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                    #{log.id}
                </td>

                {/* User */}
                <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {log.username ?? (
                            <span className="italic text-slate-400">guest</span>
                        )}
                    </div>
                    {log.user_id && (
                        <div className="text-xs text-slate-400">id:{log.user_id}</div>
                    )}
                </td>

                {/* Action */}
                <td className="px-4 py-3">
                    <span
                        className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${actionColor(log.action)}`}
                    >
                        {log.action}
                    </span>
                </td>

                {/* Subject */}
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {log.subject_type ? (
                        <span>
                            {log.subject_type}
                            {log.subject_id && (
                                <span className="ml-1 text-xs text-slate-400">
                                    #{log.subject_id}
                                </span>
                            )}
                        </span>
                    ) : (
                        "—"
                    )}
                </td>

                {/* Old / New */}
                <td className="px-4 py-3 text-center">
                    {hasDetails ? (
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-xs text-slate-400">
                                {log.old_values ? "▲" : "—"}
                                {" / "}
                                {log.new_values ? "▼" : "—"}
                            </span>
                            {expanded ? (
                                <ChevronDown className="size-3.5 text-slate-400" />
                            ) : (
                                <ChevronRight className="size-3.5 text-slate-400" />
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                </td>

                {/* IP */}
                <td className="px-4 py-3 text-xs font-mono text-slate-400">
                    {log.ip_address ?? "—"}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-xs text-slate-400">
                    {formatDateTime(log.created_at)}
                </td>
            </tr>

            {/* Expanded row */}
            {expanded && hasDetails && (
                <tr className="bg-slate-50/80 dark:bg-slate-800/60">
                    <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                                    Avvalgi qiymatlar (old_values)
                                </p>
                                <JsonBlock data={log.old_values} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                                    Yangi qiymatlar (new_values)
                                </p>
                                <JsonBlock data={log.new_values} />
                            </div>
                        </div>
                        {log.user_agent && (
                            <p className="mt-3 text-xs text-slate-400 truncate">
                                <span className="font-semibold">UA: </span>
                                {log.user_agent}
                            </p>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AuditLogs() {
    const { logs } = usePage().props;
    const [filter, setFilter] = useState("");

    const filtered = useMemo(() => {
        if (!filter.trim()) return logs;
        const q = filter.trim().toLowerCase();
        return logs.filter(
            (l) =>
                l.action?.toLowerCase().includes(q) ||
                l.username?.toLowerCase().includes(q) ||
                l.subject_type?.toLowerCase().includes(q) ||
                String(l.subject_id ?? "").includes(q) ||
                String(l.user_id ?? "").includes(q) ||
                (l.ip_address ?? "").includes(q)
        );
    }, [logs, filter]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <Head title="Audit Loglari" />

            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700 flex items-center justify-center shadow-md shadow-slate-200 dark:shadow-slate-900/40">
                        <ClipboardList className="size-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            Audit Loglari
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            So'ngi {logs.length} ta yozuv (o'qish rejimi)
                        </p>
                    </div>
                </div>

                {/* Search / Filter */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Action, user, IP..."
                        className="pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all w-56
                            bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                            text-slate-900 dark:text-white placeholder-slate-400
                            focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                    />
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["create", "update", "delete", "login"].map((key) => {
                    const count = logs.filter((l) =>
                        l.action?.toLowerCase().includes(key)
                    ).length;
                    return (
                        <div
                            key={key}
                            className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-4 shadow-sm"
                        >
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                                {key}
                            </p>
                            <p className={`text-2xl font-bold ${count > 0 ? "text-slate-800 dark:text-white" : "text-slate-300 dark:text-slate-600"}`}>
                                {count}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                    <ClipboardList className="size-12 mb-3 opacity-40" />
                    <p className="text-sm font-medium">
                        {filter ? "Natija topilmadi" : "Loglar mavjud emas"}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700/60">
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                                        ID
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Foydalanuvchi
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Amal
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Ob'ekt
                                    </th>
                                    <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                                        Old / New
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        IP
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                                        Sana
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                                {filtered.map((log) => (
                                    <LogRow key={log.id} log={log} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-400">
                        Ko'rsatilmoqda: {filtered.length} / {logs.length} ta yozuv
                        {filter && (
                            <button
                                onClick={() => setFilter("")}
                                className="ml-3 text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                            >
                                Filterni tozalash
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
