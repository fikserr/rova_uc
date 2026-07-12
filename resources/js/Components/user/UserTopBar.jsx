import { Link, router } from "@inertiajs/react";
import axios from "axios";
import { Bell, Headphones, Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ── Debounced product search, shared by desktop + mobile ──────── */
function useProductSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = query.trim();
        if (!q) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const timer = setTimeout(() => {
            axios
                .get("/shop/search", { params: { q } })
                .then((r) => setResults(r.data.results ?? []))
                .catch(() => setResults([]))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const reset = () => {
        setQuery("");
        setResults([]);
        setLoading(false);
    };

    return { query, setQuery, results, loading, reset };
}

function goToProduct(item) {
    router.visit("/shop", {
        data: { category: item.category, game: item.name },
    });
}

/* ── Reusable results list ──────────────────────────────────────── */
function SearchResults({ loading, results, onSelect }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-6 text-slate-400 text-sm gap-2">
                <Loader2 className="size-4 animate-spin" />
                Qidirilmoqda...
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-slate-500">
                Hech narsa topilmadi
            </div>
        );
    }

    return results.map((item) => (
        <button
            key={`${item.category}-${item.name}`}
            onClick={() => onSelect(item)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
        >
            <div className="size-9 rounded-lg overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Search className="size-4 text-slate-500" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                    {item.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                    {item.category}
                </p>
            </div>
        </button>
    ));
}

export default function UserTopBar({ notificationCount = 0 }) {
    /* Desktop inline dropdown */
    const desktopSearch = useProductSearch();
    const [desktopOpen, setDesktopOpen] = useState(false);
    const desktopBoxRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (
                desktopBoxRef.current &&
                !desktopBoxRef.current.contains(e.target)
            ) {
                setDesktopOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const desktopShowDropdown =
        desktopOpen && desktopSearch.query.trim().length > 0;

    /* Mobile full-screen overlay */
    const [mobileOpen, setMobileOpen] = useState(false);
    const mobileSearch = useProductSearch();
    const mobileInputRef = useRef(null);

    useEffect(() => {
        if (mobileOpen) {
            mobileInputRef.current?.focus();
        } else {
            mobileSearch.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mobileOpen]);

    return (
        <>
            {/* ── Desktop top bar ─────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-4 h-16 px-6 shrink-0 bg-[#0b0a12]/95 backdrop-blur border-b border-white/5 z-9999">
                <div className="flex-1 max-w-xl relative" ref={desktopBoxRef}>
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <input
                        type="text"
                        value={desktopSearch.query}
                        onChange={(e) => {
                            desktopSearch.setQuery(e.target.value);
                            setDesktopOpen(true);
                        }}
                        onFocus={() => setDesktopOpen(true)}
                        placeholder="O'yin yoki xizmat qidirish..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600/60"
                    />
                    {desktopSearch.query && (
                        <button
                            onClick={desktopSearch.reset}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            <X className="size-4" />
                        </button>
                    )}

                    {desktopShowDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#14121f] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto z-50">
                            <SearchResults
                                loading={desktopSearch.loading}
                                results={desktopSearch.results}
                                onSelect={(item) => {
                                    setDesktopOpen(false);
                                    desktopSearch.reset();
                                    goToProduct(item);
                                }}
                            />
                        </div>
                    )}
                </div>

                <Link
                    href="/user-help"
                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                    <Headphones className="size-4.5" />
                    Qo'llab-quvvatlash
                </Link>

                <Link
                    href="/user-notifications"
                    className="relative size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                    <Bell className="size-4.5" />
                    {notificationCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {notificationCount}
                        </span>
                    )}
                </Link>
            </div>

            {/* ── Mobile top bar ──────────────────────────────────── */}
            <div className="flex lg:hidden items-center justify-between h-14 px-4 shrink-0 bg-[#0b0a12]/95 backdrop-blur border-b border-white/5">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="flex items-center gap-2 flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-slate-500 text-left"
                >
                    <Search className="size-4 shrink-0" />
                    <span className="truncate">Qidirish...</span>
                </button>

                <Link
                    href="/user-notifications"
                    className="relative size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 ml-3 shrink-0"
                >
                    <Bell className="size-4.5" />
                    {notificationCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {notificationCount}
                        </span>
                    )}
                </Link>
            </div>

            {/* ── Mobile full-screen search overlay ──────────────── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 bg-[#0b0a12] flex flex-col lg:hidden">
                    <div className="flex items-center gap-2 h-14 px-4 shrink-0 border-b border-white/5">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                            <input
                                ref={mobileInputRef}
                                type="text"
                                value={mobileSearch.query}
                                onChange={(e) =>
                                    mobileSearch.setQuery(e.target.value)
                                }
                                placeholder="O'yin yoki xizmat qidirish..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600/60"
                            />
                            {mobileSearch.query && (
                                <button
                                    onClick={mobileSearch.reset}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="text-sm font-semibold text-slate-300 shrink-0 px-1"
                        >
                            Bekor qilish
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {mobileSearch.query.trim().length > 0 ? (
                            <SearchResults
                                loading={mobileSearch.loading}
                                results={mobileSearch.results}
                                onSelect={(item) => {
                                    setMobileOpen(false);
                                    goToProduct(item);
                                }}
                            />
                        ) : (
                            <div className="py-16 text-center text-sm text-slate-500">
                                O'yin yoki xizmat nomini kiriting
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
