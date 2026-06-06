import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    Ban,
    Check,
    ChevronDown,
    ChevronUp,
    CreditCard,
    ExternalLink,
    Minus,
    Pencil,
    Plus,
    Search,
    Shield,
    ShieldOff,
    User,
    Wrench,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLES = [
    {
        value: "user",
        label: "User",
        icon: User,
        color: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    },
    {
        value: "worker",
        label: "Worker",
        icon: Wrench,
        color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    },
    {
        value: "admin",
        label: "Admin",
        icon: Shield,
        color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
    },
];

function roleMeta(role) {
    return ROLES.find((r) => r.value === role) ?? ROLES[0];
}

// ── Balance Modal ─────────────────────────────────────────────────────────────

function BalanceModal({ user, onClose, onDone }) {
    const [amount, setAmount] = useState("");
    const [sign, setSign] = useState("+"); // + | -
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const submit = async () => {
        const num = parseFloat(amount);
        if (!num || num <= 0) {
            setErr("Miqdor kiriting");
            return;
        }
        setLoading(true);
        setErr("");
        try {
            await axios.post(`/users/${user.id}/balance`, {
                amount: sign === "+" ? num : -num,
            });
            onDone();
            onClose();
        } catch (e) {
            setErr(e.response?.data?.message ?? "Xatolik yuz berdi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <p className="font-bold text-slate-800 dark:text-white">
                            Balans o'zgartirish
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            @{user.username}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <CreditCard className="size-4 text-slate-400" />
                        <div>
                            <p className="text-xs text-slate-500">
                                Joriy balans
                            </p>
                            <p className="font-bold text-slate-800 dark:text-white">
                                {Number(user.balance || 0).toLocaleString(
                                    "fr-FR",
                                )}{" "}
                                UZS
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {["+", "-"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setSign(s)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    sign === s
                                        ? s === "+"
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-2 ring-emerald-300 dark:ring-emerald-700"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 ring-2 ring-rose-300 dark:ring-rose-700"
                                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                            >
                                {s === "+" ? (
                                    <Plus className="size-4" />
                                ) : (
                                    <Minus className="size-4" />
                                )}
                                {s === "+" ? "Qo'shish" : "Ayirish"}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            placeholder="Miqdor (UZS)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 pr-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            autoFocus
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                            UZS
                        </span>
                    </div>

                    {err && <p className="text-xs text-rose-500">{err}</p>}

                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Bekor
                        </button>
                        <button
                            onClick={submit}
                            disabled={loading || !amount}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-95 ${
                                sign === "+"
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-rose-600 hover:bg-rose-700"
                            }`}
                        >
                            {loading
                                ? "..."
                                : sign === "+"
                                  ? "Qo'shish"
                                  : "Ayirish"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Inline Balance Editor ─────────────────────────────────────────────────────

function InlineBalanceEditor({ user, onDone }) {
    const [editing, setEditing] = useState(false);
    const [sign, setSign] = useState("+");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const inputRef = useRef(null);

    const open = () => {
        setEditing(true);
        setAmount("");
        setSign("+");
        setErr("");
        setTimeout(() => inputRef.current?.focus(), 50);
    };
    const close = () => {
        setEditing(false);
        setAmount("");
        setErr("");
    };

    const save = async () => {
        const num = parseFloat(amount);
        if (!num || num <= 0) {
            setErr("Miqdor kiriting");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`/users/${user.id}/balance`, {
                amount: sign === "+" ? num : -num,
            });
            onDone();
            close();
        } catch (e) {
            setErr(e.response?.data?.message ?? "Xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") close();
    };

    if (!editing) {
        return (
            <button
                onClick={open}
                className="group flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                title="Balansni o'zgartirish"
            >
                {Number(user.balance || 0).toLocaleString("fr-FR")}
                <Pencil className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            </button>
        );
    }

    return (
        <div className="flex flex-col gap-1 min-w-45">
            <div className="flex items-center gap-1">
                {/* +/- toggle */}
                <button
                    onClick={() => setSign((s) => (s === "+" ? "-" : "+"))}
                    className={`shrink-0 size-7 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                        sign === "+"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    }`}
                >
                    {sign === "+" ? (
                        <Plus className="size-3.5" />
                    ) : (
                        <Minus className="size-3.5" />
                    )}
                </button>

                {/* Amount input */}
                <input
                    ref={inputRef}
                    type="number"
                    min="1"
                    placeholder="Miqdor"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyDown={handleKey}
                    className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />

                {/* Save */}
                <button
                    onClick={save}
                    disabled={loading || !amount}
                    className="shrink-0 size-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-50 transition-colors"
                >
                    {loading ? (
                        <span className="size-3 border border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Check className="size-3.5" />
                    )}
                </button>

                {/* Cancel */}
                <button
                    onClick={close}
                    className="shrink-0 size-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                    <X className="size-3.5" />
                </button>
            </div>
            {err && <p className="text-[10px] text-rose-500">{err}</p>}
        </div>
    );
}

// ── Role Dropdown with Portal ─────────────────────────────────────────────

function RoleDropdown({ user, onDone }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const portalRef = useRef(null);
    const meta = roleMeta(user.role);
    const Icon = meta.icon;

    const changeRole = async (role) => {
        if (role === user.role) {
            setOpen(false);
            return;
        }
        setLoading(true);
        try {
            await axios.put(`/users/${user.id}/role`, { role });
            onDone();
        } catch (e) {
            alert(e.response?.data?.message ?? "Xatolik.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    useEffect(() => {
        if (!open || !buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 140;
        const screenWidth = window.innerWidth;

        const left = Math.min(rect.left, screenWidth - dropdownWidth - 8);

        setPosition({
            top: rect.bottom + 8, // no window.scrollY — fixed is viewport-relative
            left: Math.max(8, left),
        });

        const handleClickOutside = (e) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(e.target) &&
                portalRef.current &&
                !portalRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        const handleScroll = () => setOpen(false);

        document.addEventListener("click", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true); // true = capture all scroll events
        return () => {
            document.removeEventListener("click", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [open]);
    
    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setOpen((o) => !o)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${meta.color} ${loading ? "opacity-50" : "hover:opacity-80"}`}
            >
                <Icon className="size-3" />
                {meta.label}
                <ChevronDown
                    className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={portalRef}
                        className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden min-w-35"
                        style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                        }}
                    >
                        {ROLES.map((r) => {
                            const RIcon = r.icon;
                            const isSelected = r.value === user.role;
                            return (
                                <button
                                    key={r.value}
                                    onClick={() =>
                                        !isSelected && changeRole(r.value)
                                    }
                                    disabled={isSelected}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                                        isSelected
                                            ? "bg-slate-100 dark:bg-slate-700/50 opacity-60 cursor-default"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                                    }`}
                                >
                                    <span
                                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${r.color}`}
                                    >
                                        <RIcon className="size-3" />
                                        {r.label}
                                    </span>
                                    {isSelected && (
                                        <Check className="size-3 ml-auto text-blue-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>,
                    document.body,
                )}
        </>
    );
}

// ── Block Button ──────────────────────────────────────────────────────────────

function BlockButton({ user, onDone }) {
    const [loading, setLoading] = useState(false);

    const toggle = async () => {
        const action = user.is_blocked ? "blokdan chiqarish" : "bloklash";
        if (
            !confirm(
                `@${user.username || user.id} ni ${action}ni tasdiqlaysizmi?`,
            )
        )
            return;
        setLoading(true);
        try {
            await axios.post(`/users/${user.id}/toggle-block`);
            onDone();
        } catch (e) {
            alert(e.response?.data?.message ?? "Xatolik yuz berdi.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <span className="size-7 flex items-center justify-center">
                <span className="size-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </span>
        );
    }

    return user.is_blocked ? (
        <button
            onClick={toggle}
            title="Blokdan chiqarish"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
        >
            <ShieldOff className="size-3.5" />
            Bloklangan
        </button>
    ) : (
        <button
            onClick={toggle}
            title="Bloklash"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors"
        >
            <ShieldOff className="size-4" />
        </button>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Users({ users: initialUsers }) {
    const { auth } = usePage().props;
    const myId = auth?.user?.id;

    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [expandedId, setExpandedId] = useState(null);

    const reload = () =>
        router.reload({ only: ["users"], preserveScroll: true });

    const filtered = users.filter((u) => {
        const matchSearch =
            (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.phone_number || "").includes(search);
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const stats = {
        total: users.length,
        active: users.filter((u) => u.isActive).length,
        workers: users.filter((u) => u.role === "worker").length,
        balance: users.reduce((s, u) => s + Number(u.balance || 0), 0),
        spent: users.reduce((s, u) => s + Number(u.totalSpent || 0), 0),
    };

    return (
        <div className="p-4 sm:p-6 lg:p-0 transition-colors duration-300">
            <Head title="Users Management" />

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">
                    Users Management
                </h2>
                <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
                    Foydalanuvchilarni boshqarish, rol va balans o'zgartirish
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {[
                    {
                        label: "Jami",
                        value: stats.total,
                        color: "text-slate-800 dark:text-white",
                    },
                    {
                        label: "Faol",
                        value: stats.active,
                        color: "text-emerald-600",
                    },
                    {
                        label: "Worker",
                        value: stats.workers,
                        color: "text-amber-600",
                    },
                    {
                        label: "Jami balans",
                        value: stats.balance.toLocaleString("fr-FR") + " UZS",
                        color: "text-blue-600",
                    },
                    {
                        label: "Jami sarflangan",
                        value: stats.spent.toLocaleString("fr-FR") + " UZS",
                        color: "text-purple-600",
                    },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
                    >
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            {s.label}
                        </p>
                        <p className={`text-lg font-bold truncate ${s.color}`}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 mb-4 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                        type="text"
                        placeholder="Username yoki telefon raqami..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400"
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    {["all", "user", "worker", "admin"].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                roleFilter === r
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            {r === "all"
                                ? "Barchasi"
                                : r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden xl:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                            {[
                                "User ID",
                                "Username",
                                "Telefon",
                                "Balans (bosib o'zgartiring)",
                                "Buyurtmalar",
                                "Jami sarflangan",
                                "Sana",
                                "Rol",
                                "Status",
                                "TG",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                                    {user.id}
                                </td>
                                <td className="px-4 py-3 font-semibold text-sm text-slate-800 dark:text-white">
                                    {user.username
                                        ? user.username.length > 14
                                            ? user.username.slice(0, 14) + "…"
                                            : user.username
                                        : "—"}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                    {user.phone_number || "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <InlineBalanceEditor
                                        user={user}
                                        onDone={reload}
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {user.totalOrders}
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-purple-600">
                                    {Number(
                                        user.totalSpent || 0,
                                    ).toLocaleString("fr-FR")}{" "}
                                    UZS
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                    {user.created_at
                                        ? new Date(
                                              user.created_at,
                                          ).toLocaleDateString("ru-RU")
                                        : "—"}
                                </td>
                                <td className="px-4 py-3">
                                    {user.id === myId ? (
                                        <span
                                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${roleMeta(user.role).color}`}
                                        >
                                            {(() => {
                                                const I = roleMeta(
                                                    user.role,
                                                ).icon;
                                                return <I className="size-3" />;
                                            })()}
                                            {roleMeta(user.role).label}
                                        </span>
                                    ) : (
                                        <RoleDropdown
                                            user={user}
                                            onDone={reload}
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                user.is_blocked
                                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                                    : user.isActive
                                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                      : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                            }`}
                                        >
                                            {user.is_blocked
                                                ? "Bloklangan"
                                                : user.isActive
                                                  ? "Faol"
                                                  : "Offline"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        {user.username && (
                                            <a
                                                href={`https://t.me/${user.username}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors inline-flex"
                                                title="Telegram da ko'rish"
                                            >
                                                <ExternalLink className="size-4" />
                                            </a>
                                        )}
                                        {user.id !== myId && (
                                            <BlockButton
                                                user={user}
                                                onDone={reload}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={10}
                                    className="px-4 py-10 text-center text-sm text-slate-400"
                                >
                                    Foydalanuvchi topilmadi
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="xl:hidden space-y-3">
                {filtered.map((user) => {
                    const isExpanded = expandedId === user.id;
                    const meta = roleMeta(user.role);
                    const RIcon = meta.icon;

                    return (
                        <div
                            key={user.id}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden"
                        >
                            <button
                                onClick={() =>
                                    setExpandedId(isExpanded ? null : user.id)
                                }
                                className="w-full text-left p-4 flex items-center justify-between gap-3"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-800 dark:text-white leading-tight truncate">
                                        {user.username || "—"}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                        {user.phone_number || "—"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {user.is_blocked && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                            Bloklangan
                                        </span>
                                    )}
                                    <span
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}
                                    >
                                        <RIcon className="size-3" />
                                        {meta.label}
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp className="size-4 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="size-4 text-slate-400" />
                                    )}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                                        {[
                                            {
                                                label: "Balans",
                                                value: `${Number(user.balance || 0).toLocaleString("fr-FR")} UZS`,
                                                color: "text-blue-600 font-bold",
                                            },
                                            {
                                                label: "Buyurtmalar",
                                                value: user.totalOrders,
                                            },
                                            {
                                                label: "Sarflangan",
                                                value: `${Number(user.totalSpent || 0).toLocaleString("fr-FR")} UZS`,
                                                color: "text-purple-600 font-bold",
                                            },
                                            {
                                                label: "User ID",
                                                value: `#${user.id}`,
                                                mono: true,
                                            },
                                            {
                                                label: "Qo'shilgan",
                                                value: user.created_at
                                                    ? new Date(
                                                          user.created_at,
                                                      ).toLocaleDateString(
                                                          "ru-RU",
                                                      )
                                                    : "—",
                                            },
                                            {
                                                label: "Status",
                                                value: user.isActive
                                                    ? "Faol"
                                                    : "Offline",
                                                color: user.isActive
                                                    ? "text-emerald-600"
                                                    : "text-slate-400",
                                            },
                                        ].map(
                                            ({ label, value, color, mono }) => (
                                                <div key={label}>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        {label}
                                                    </p>
                                                    <p
                                                        className={`text-sm mt-0.5 ${mono ? "font-mono text-xs" : ""} ${color ?? "text-slate-800 dark:text-slate-200"}`}
                                                    >
                                                        {value}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            {user.id !== myId ? (
                                                <RoleDropdown
                                                    user={user}
                                                    onDone={reload}
                                                />
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    O'z rolingiz
                                                </span>
                                            )}
                                            <div className="flex items-center gap-1">
                                                {user.username && (
                                                    <a
                                                        href={`https://t.me/${user.username}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    >
                                                        <ExternalLink className="size-4" />
                                                    </a>
                                                )}
                                                {user.id !== myId && (
                                                    <BlockButton
                                                        user={user}
                                                        onDone={reload}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1.5">
                                                Balansni o'zgartirish
                                            </p>
                                            <InlineBalanceEditor
                                                user={user}
                                                onDone={reload}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <Ban className="size-10 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Foydalanuvchi topilmadi</p>
                    </div>
                )}
            </div>
        </div>
    );
}
