import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Save,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CATEGORY_COLORS = {
    Game: "from-violet-500 to-purple-600",
    "Aplikasi Premium": "from-blue-500 to-indigo-600",
    "E-Wallet": "from-emerald-500 to-teal-600",
    SMM: "from-pink-500 to-rose-600",
    "Top Up & Digital Services": "from-amber-500 to-orange-600",
    Tagihan: "from-slate-500 to-gray-600",
    Voucher: "from-cyan-500 to-sky-600",
};

function catColor(cat) {
    return CATEGORY_COLORS[cat] ?? "from-slate-400 to-slate-600";
}

/* ---------- Breadcrumb / back nav ---------- */

function Breadcrumb({ items, onNavigate }) {
    // items: [{ label, onClick? }] - last item is current (not clickable)
    return (
        <div className="flex items-center gap-1 sm:gap-1.5 mb-4 text-xs sm:text-sm flex-wrap">
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <div key={i} className="flex items-center gap-1.5">
                        {i > 0 && (
                            <ChevronRight className="size-3.5 text-slate-300 dark:text-slate-600" />
                        )}
                        {isLast ? (
                            <span className="font-bold text-slate-800 dark:text-white">
                                {item.label}
                            </span>
                        ) : (
                            <button
                                onClick={() => onNavigate(i)}
                                className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                            >
                                {item.label}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function BackButton({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
            <ChevronLeft className="size-4" />
            {label}
        </button>
    );
}

/* ---------- Variant editing row ---------- */
/* Grid column template shared between header + rows on md+ screens */
const VARIANT_GRID_COLS =
    "md:grid-cols-[minmax(0,2fr)_90px_110px_110px_64px_84px_120px]";

function VariantRow({ product, onSaved }) {
    const [editing, setEditing] = useState(false);
    const [priceUzs, setPriceUzs] = useState(String(product.price_uzs));
    const [resellerPrice, setResellerPrice] = useState(String(product.reseller_price_uzs ?? ""));
    const [active, setActive] = useState(product.is_active);
    const [visibleUsers, setVisibleUsers]         = useState(product.visible_to_users ?? true);
    const [visibleResellers, setVisibleResellers] = useState(product.visible_to_resellers ?? true);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const res = await axios.put(`/sekali-products/${product.id}`, {
                price_uzs:            parseInt(priceUzs),
                reseller_price_uzs:   resellerPrice ? parseInt(resellerPrice) : null,
                is_active:            active,
                visible_to_users:     visibleUsers,
                visible_to_resellers: visibleResellers,
            });
            onSaved(res.data.product);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const cancel = () => {
        setEditing(false);
        setPriceUzs(String(product.price_uzs));
        setResellerPrice(String(product.reseller_price_uzs ?? ""));
        setActive(product.is_active);
        setVisibleUsers(product.visible_to_users ?? true);
        setVisibleResellers(product.visible_to_resellers ?? true);
    };

    const statusPill = (isOn) => (
        <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isOn ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700"}`}
        >
            {isOn ? "Aktiv" : "Yopiq"}
        </span>
    );

    const priceInput = (
        <input
            type="number"
            value={priceUzs}
            onChange={(e) => setPriceUzs(e.target.value)}
            min="100"
            step="1000"
            className="w-full md:w-28 text-right px-2 py-1.5 rounded-lg border border-violet-300 dark:border-violet-600 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
    );

    const activeToggle = (
        <div className="flex flex-col gap-1 items-start">
            <button
                onClick={() => setActive((a) => !a)}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700"}`}
            >
                {active ? "Aktiv" : "Yopiq"}
            </button>
            <button
                onClick={() => setVisibleUsers((v) => !v)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${visibleUsers ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 line-through"}`}
            >
                👤 User
            </button>
            <button
                onClick={() => setVisibleResellers((v) => !v)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${visibleResellers ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 line-through"}`}
            >
                🏪 Reseller
            </button>
        </div>
    );

    const editActions = (
        <div className="flex items-center gap-1.5">
            <button
                onClick={save}
                disabled={saving}
                className="p-2 md:p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50"
            >
                {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                ) : (
                    <Save className="size-3.5" />
                )}
            </button>
            <button
                onClick={cancel}
                className="p-2 md:p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );

    return (
        <>
            {/* Desktop / tablet: grid row (md and up) */}
            <div
                className={`hidden md:grid ${VARIANT_GRID_COLS} gap-2 items-center px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0`}
            >
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {product.name}
                </span>
                <span className="text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                    {Number(product.price_idr).toLocaleString()}
                </span>
                <span className="text-right">
                    {editing ? (
                        priceInput
                    ) : (
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                            {Number(product.price_uzs).toLocaleString()}
                        </span>
                    )}
                </span>
                <span className="text-right">
                    {editing ? (
                        <input
                            type="number"
                            value={resellerPrice}
                            onChange={(e) => setResellerPrice(e.target.value)}
                            min="100"
                            step="1000"
                            placeholder="—"
                            className="w-full md:w-28 text-right px-2 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    ) : (
                        <span className={`text-sm font-bold ${product.reseller_price_uzs ? "text-emerald-600 dark:text-emerald-400" : "text-slate-300 dark:text-slate-600"}`}>
                            {product.reseller_price_uzs
                                ? Number(product.reseller_price_uzs).toLocaleString()
                                : "—"}
                        </span>
                    )}
                </span>
                <span className="text-center text-xs text-slate-400">
                    {Number(product.markup_percent).toFixed(1)}%
                </span>
                <span className="flex justify-center">
                    {editing ? activeToggle : (
                        <div className="flex flex-col gap-0.5 items-center">
                            {statusPill(product.is_active)}
                            <div className="flex gap-1 mt-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${product.visible_to_users ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 line-through"}`}>
                                    👤
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${product.visible_to_resellers ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 line-through"}`}>
                                    🏪
                                </span>
                            </div>
                        </div>
                    )}
                </span>
                <span className="flex justify-center">
                    {editing ? (
                        editActions
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        >
                            Tahrir
                        </button>
                    )}
                </span>
            </div>

            {/* Mobile: stacked card (below md) */}
            <div className="md:hidden px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm text-slate-700 dark:text-slate-300 min-w-0 flex-1">
                        {product.name}
                    </p>
                    {editing ? null : statusPill(product.is_active)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>
                        IDR:{" "}
                        <span className="font-mono">
                            {Number(product.price_idr).toLocaleString()}
                        </span>
                    </span>
                    <span>
                        Foyda: {Number(product.markup_percent).toFixed(1)}%
                    </span>
                </div>

                {editing ? (
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                            {priceInput}
                            <span className="text-xs text-slate-400 shrink-0">UZS</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={resellerPrice}
                                onChange={(e) => setResellerPrice(e.target.value)}
                                min="100"
                                step="1000"
                                placeholder="Reseller narx"
                                className="w-full text-right px-2 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <span className="text-xs text-emerald-600 shrink-0">R</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActive((a) => !a)}
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700"}`}
                            >
                                {active ? "Aktiv" : "Yopiq"}
                            </button>
                            <button
                                onClick={() => setVisibleUsers((v) => !v)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${visibleUsers ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 line-through"}`}
                            >
                                👤 User
                            </button>
                            <button
                                onClick={() => setVisibleResellers((v) => !v)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${visibleResellers ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 line-through"}`}
                            >
                                🏪 Reseller
                            </button>
                        </div>
                        <div className="flex justify-end">
                            {editActions}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-base font-bold text-slate-800 dark:text-white">
                                    {Number(product.price_uzs).toLocaleString()} UZS
                                </span>
                                {product.reseller_price_uzs && (
                                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        R: {Number(product.reseller_price_uzs).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-1.5 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${product.visible_to_users ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 line-through"}`}>
                                    👤 User
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${product.visible_to_resellers ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 line-through"}`}>
                                    🏪 Reseller
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditing(true)}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors shrink-0"
                        >
                            Tahrir
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

/* ---------- Type (server/variant group) table ---------- */

function TypeSection({
    typeName,
    products: initProducts,
    idrRate,
    markup,
    onBulkApply,
}) {
    const [products, setProducts] = useState(initProducts);
    const [bulkMarkup, setBulkMarkup] = useState(markup);
    const [applying, setApplying] = useState(false);

    const handleSaved = (updated) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
        );
    };

    const applyBulk = async () => {
        setApplying(true);
        try {
            await onBulkApply(bulkMarkup, typeName);
            setProducts((prev) =>
                prev.map((p) => {
                    const cost = p.price_idr * idrRate;
                    return {
                        ...p,
                        markup_percent: bulkMarkup,
                        price_uzs: Math.ceil(cost * (1 + bulkMarkup / 100)),
                    };
                }),
            );
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="mb-3">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/60 rounded-lg mb-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    {typeName}{" "}
                    <span className="font-normal text-slate-400">
                        ({products.length})
                    </span>
                </span>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={bulkMarkup}
                        onChange={(e) =>
                            setBulkMarkup(parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        max="500"
                        className="w-16 text-right px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <span className="text-xs text-slate-400">%</span>
                    <button
                        onClick={applyBulk}
                        disabled={applying}
                        className="px-2.5 py-1.5 md:py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
                    >
                        {applying ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : null}
                        Qo'lla
                    </button>
                </div>
            </div>

            {/* Header row: only shown on md+, mobile cards self-label each field */}
            <div
                className={`hidden md:grid ${VARIANT_GRID_COLS} gap-2 px-4 py-1.5 text-xs text-slate-400 uppercase`}
            >
                <span className="text-left">Variant</span>
                <span className="text-right">IDR</span>
                <span className="text-right">UZS narx</span>
                <span className="text-right text-emerald-600 dark:text-emerald-400">Reseller</span>
                <span className="text-center">Foyda%</span>
                <span className="text-center">Holat</span>
                <span className="text-center">Amal</span>
            </div>

            <div>
                {products.map((p) => (
                    <VariantRow key={p.id} product={p} onSaved={handleSaved} />
                ))}
            </div>
        </div>
    );
}

/* ---------- Server (type) list screen inside a game ---------- */

function ServerListPage({
    category,
    game,
    types,
    grouped,
    total,
    typeVisibility: initTypeVis = {},
    onSelectType,
    onBack,
    onBreadcrumb,
}) {
    const [filter, setFilter] = useState("");
    const [typeVis, setTypeVis] = useState(initTypeVis);
    const [toggling, setToggling] = useState({});

    const toggleVis = async (type, field) => {
        const key = `${type}-${field}`;
        if (toggling[key]) return;
        const current = typeVis[type]?.[field] ?? true;
        const newVal = !current;
        setTypeVis((prev) => ({
            ...prev,
            [type]: { ...(prev[type] ?? { users: true, resellers: true }), [field]: newVal },
        }));
        setToggling((p) => ({ ...p, [key]: true }));
        try {
            await axios.post('/admin/sekali-products/game-visibility', {
                category,
                game_name: game,
                product_type: type,
                field: field === 'users' ? 'visible_to_users' : 'visible_to_resellers',
                value: newVal,
            });
        } catch {
            setTypeVis((prev) => ({
                ...prev,
                [type]: { ...(prev[type] ?? {}), [field]: current },
            }));
        } finally {
            setToggling((p) => ({ ...p, [key]: false }));
        }
    };

    const filteredTypes = filter.trim()
        ? types.filter((t) => t.toLowerCase().includes(filter.trim().toLowerCase()))
        : types;

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Kategoriyalar" },
                    { label: category },
                    { label: game },
                ]}
                onNavigate={onBreadcrumb}
            />
            <BackButton label={`${category} ga qaytish`} onClick={onBack} />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Jami: <strong>{total}</strong> variant,{" "}
                    <strong>{types.length}</strong> server/tur
                </span>
                {types.length > 6 && (
                    <input
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Server qidirish..."
                        className="w-full sm:w-48 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTypes.map((type) => {
                    const count = (grouped[type] ?? []).length;
                    const tVis = typeVis[type] ?? { users: true, resellers: true };
                    const hidden = !tVis.users && !tVis.resellers;
                    return (
                        <div
                            key={type}
                            className={`flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl transition-all ${
                                hidden
                                    ? "border-slate-200 dark:border-slate-700 opacity-50"
                                    : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-sm"
                            }`}
                        >
                            <button
                                onClick={() => onSelectType(type)}
                                className="flex-1 text-left min-w-0"
                            >
                                <p className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide truncate">
                                    {type}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-400">{count} ta variant</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleVis(type, 'users'); }}
                                        title={tVis.users ? "Userlardan yashirish" : "Userlarga ko'rsatish"}
                                        className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                                            tVis.users
                                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                : "bg-slate-100 dark:bg-slate-700 text-slate-400 line-through"
                                        }`}
                                    >
                                        👤 U
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleVis(type, 'resellers'); }}
                                        title={tVis.resellers ? "Resellerlardan yashirish" : "Resellerga ko'rsatish"}
                                        className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                                            tVis.resellers
                                                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                                : "bg-slate-100 dark:bg-slate-700 text-slate-400 line-through"
                                        }`}
                                    >
                                        🏪 R
                                    </button>
                                </div>
                            </button>
                            <ChevronRight
                                onClick={() => onSelectType(type)}
                                className="size-4 text-slate-300 dark:text-slate-600 shrink-0 cursor-pointer ml-2"
                            />
                        </div>
                    );
                })}
                {filteredTypes.length === 0 && (
                    <p className="text-sm text-slate-400 col-span-full py-6 text-center">
                        Hech narsa topilmadi
                    </p>
                )}
            </div>
        </div>
    );
}

/* ---------- Single server's variant table, full screen ---------- */

function ServerDetailPage({
    category,
    game,
    type,
    products,
    idrRate,
    onBulkApply,
    onBack,
    onBreadcrumb,
}) {
    // breadcrumb click: 0/1 = go up to root state (category/game reset), 2 = back to server list
    const handleBreadcrumb = (level) => {
        if (level <= 1) onBreadcrumb(level);
        else onBack();
    };

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Kategoriyalar" },
                    { label: category },
                    { label: game },
                    { label: type },
                ]}
                onNavigate={handleBreadcrumb}
            />
            <BackButton label="Serverlarga qaytish" onClick={onBack} />

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="p-2 sm:p-4">
                    <TypeSection
                        typeName={type}
                        products={products}
                        idrRate={idrRate}
                        markup={20}
                        onBulkApply={onBulkApply}
                    />
                </div>
            </div>
        </div>
    );
}

/* ---------- Full-screen "page" for a single game: loads data, routes to server list or detail ---------- */

function GamePage({ category, game, idrRate, onBack, onBreadcrumb }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const loaded = useRef(false);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;
        setLoading(true);
        axios
            .get("/sekali-products/variants", { params: { category, game } })
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    const handleBulkApply = async (markup, productType) => {
        await axios.post("/sekali-products/bulk-markup", {
            markup_percent: markup,
            category,
            game,
            product_type: productType === "Standard" ? null : productType,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-violet-500" />
            </div>
        );
    }
    if (!data) return null;

    if (!selectedType) {
        return (
            <ServerListPage
                category={category}
                game={game}
                types={data.types}
                grouped={data.grouped}
                total={data.total}
                typeVisibility={data.type_visibility ?? {}}
                onSelectType={setSelectedType}
                onBack={onBack}
                onBreadcrumb={onBreadcrumb}
            />
        );
    }

    return (
        <ServerDetailPage
            category={category}
            game={game}
            type={selectedType}
            products={data.grouped[selectedType] ?? []}
            idrRate={idrRate}
            onBulkApply={handleBulkApply}
            onBack={() => setSelectedType(null)}
            onBreadcrumb={onBreadcrumb}
        />
    );
}

/* ---------- Page listing games inside a category ---------- */

function CategoryPage({ category, games, onSelectGame, onBack, topGames = new Set(), onTopToggle, gameVisibility: initVis = {}, onVisibilityToggle }) {
    const color = catColor(category);
    const [vis, setVis] = useState(initVis);
    const [toggling, setToggling] = useState({}); // {`${game}-users`: true}

    const toggleVis = async (game, field) => {
        const key = `${game}-${field}`;
        if (toggling[key]) return;
        const current = vis[game]?.[field] ?? true;
        const newVal = !current;
        setVis((prev) => ({
            ...prev,
            [game]: { ...(prev[game] ?? { users: true, resellers: true }), [field]: newVal },
        }));
        setToggling((p) => ({ ...p, [key]: true }));
        try {
            await axios.post('/admin/sekali-products/game-visibility', {
                category,
                game_name: game,
                field: field === 'users' ? 'visible_to_users' : 'visible_to_resellers',
                value: newVal,
            });
            onVisibilityToggle?.(category, game, field, newVal);
        } catch {
            // revert on error
            setVis((prev) => ({
                ...prev,
                [game]: { ...(prev[game] ?? {}), [field]: current },
            }));
        } finally {
            setToggling((p) => ({ ...p, [key]: false }));
        }
    };

    return (
        <div>
            <Breadcrumb
                items={[{ label: "Kategoriyalar" }, { label: category }]}
                onNavigate={onBack}
            />
            <BackButton
                label="Kategoriyalarga qaytish"
                onClick={() => onBack(0)}
            />

            {category === "Game" && (
                <p className="text-xs text-slate-400 mb-3">
                    ⭐ tugmasi bilan o'yinni "Top O'yinlar" qatoriga qo'shing — userlar bosh sahifada ko'radi
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {games.map((game) => {
                    const isTop = topGames.has(game);
                    const gVis = vis[game] ?? { users: true, resellers: true };
                    const hidden = !gVis.users && !gVis.resellers;
                    return (
                        <div
                            key={game}
                            className={`flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl transition-all ${
                                hidden
                                    ? "border-slate-200 dark:border-slate-700 opacity-50"
                                    : isTop
                                    ? "border-amber-400 dark:border-amber-500 shadow-sm shadow-amber-100 dark:shadow-amber-900/20"
                                    : "border-slate-200 dark:border-slate-700"
                            }`}
                        >
                            <button
                                onClick={() => onSelectGame(game)}
                                className="flex items-center gap-3 min-w-0 flex-1 text-left hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                            >
                                <div className={`size-8 rounded-lg bg-linear-to-br ${color} flex items-center justify-center shrink-0`}>
                                    <span className="text-white font-bold text-xs">{game.charAt(0)}</span>
                                </div>
                                <div className="min-w-0">
                                    <span className="font-semibold text-slate-800 dark:text-white text-sm truncate block">
                                        {game}
                                        {isTop && (
                                            <span className="ml-1.5 text-[10px] bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">
                                                TOP
                                            </span>
                                        )}
                                    </span>
                                    {/* Visibility badges */}
                                    <div className="flex gap-1 mt-0.5">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleVis(game, 'users'); }}
                                            title={gVis.users ? "Userlardan yashirish" : "Userlarga ko'rsatish"}
                                            className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                                                gVis.users
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                    : "bg-slate-100 dark:bg-slate-700 text-slate-400 line-through"
                                            }`}
                                        >
                                            👤 U
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleVis(game, 'resellers'); }}
                                            title={gVis.resellers ? "Resellerlardan yashirish" : "Resellerga ko'rsatish"}
                                            className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                                                gVis.resellers
                                                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                                    : "bg-slate-100 dark:bg-slate-700 text-slate-400 line-through"
                                            }`}
                                        >
                                            🏪 R
                                        </button>
                                    </div>
                                </div>
                            </button>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                {category === "Game" && (
                                    <button
                                        onClick={() => onTopToggle(category, game)}
                                        title={isTop ? "Top dan chiqarish" : "Top ga qo'shish"}
                                        className={`size-8 rounded-lg flex items-center justify-center transition-all text-base ${
                                            isTop
                                                ? "bg-amber-100 dark:bg-amber-500/15 text-amber-500"
                                                : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                        }`}
                                    >
                                        ⭐
                                    </button>
                                )}
                                <ChevronRight
                                    onClick={() => onSelectGame(game)}
                                    className="size-4 text-slate-300 dark:text-slate-600 cursor-pointer"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------- Global search across every category's items ---------- */

function GlobalSearch({ tree, categories, onJump }) {
    const [query, setQuery] = useState("");

    const q = query.trim().toLowerCase();

    // flat index built fresh each render off `tree` - cheap, no need to memoize for typical sizes
    const results = q
        ? categories.flatMap((cat) =>
              (tree[cat] ?? [])
                  .filter((item) => item.toLowerCase().includes(q))
                  .map((item) => ({ category: cat, item })),
          )
        : [];

    return (
        <div className="mb-5 relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Qidirish: o'yin, ilova, xizmat nomi..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            />

            {q && (
                <div className="absolute z-10 mt-1.5 w-full max-h-80 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                    {results.length === 0 && (
                        <p className="text-sm text-slate-400 px-4 py-3">
                            Hech narsa topilmadi
                        </p>
                    )}
                    {results.map(({ category, item }) => {
                        const color = catColor(category);
                        return (
                            <button
                                key={`${category}-${item}`}
                                onClick={() => {
                                    onJump(category, item);
                                    setQuery("");
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                            >
                                <div
                                    className={`size-7 rounded-lg bg-linear-to-br ${color} flex items-center justify-center shrink-0`}
                                >
                                    <span className="text-white font-bold text-xs">
                                        {item.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                        {item}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {category}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ---------- Top-level page listing categories ---------- */

function CategoryList({ categories, tree, onSelectCategory }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => {
                const color = catColor(cat);
                const games = tree[cat] ?? [];
                return (
                    <button
                        key={cat}
                        onClick={() => onSelectCategory(cat)}
                        className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-sm transition-all text-left"
                    >
                        <div
                            className={`size-9 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shrink-0`}
                        >
                            <span className="text-white font-bold text-sm">
                                {cat.charAt(0)}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white">
                                {cat}
                            </p>
                            <p className="text-xs text-slate-400">
                                {games.length} ta mahsulot/o'yin
                            </p>
                        </div>
                        <ChevronRight className="size-5 text-slate-300 dark:text-slate-600 shrink-0" />
                    </button>
                );
            })}
        </div>
    );
}

/* ---------- Root: drives which "screen" is shown ---------- */

export default function SekaliProducts() {
    const { tree, idr_rate, flash, top_games: initialTopGames = [], game_visibility: initialGameVis = {} } = usePage().props;
    const [topGames, setTopGames] = useState(() => new Set(initialTopGames));
    const [isSyncing, setIsSyncing] = useState(false);

    const handleTopToggle = async (category, gameName) => {
        const key = gameName;
        const wasTop = topGames.has(key);
        setTopGames((prev) => {
            const next = new Set(prev);
            wasTop ? next.delete(key) : next.add(key);
            return next;
        });
        try {
            await axios.post("/admin/top-games/toggle", { category, game_name: gameName });
        } catch {
            setTopGames((prev) => {
                const next = new Set(prev);
                wasTop ? next.add(key) : next.delete(key);
                return next;
            });
        }
    };

    // navigation state - null/null = category list screen
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);

    const categories = tree ? Object.keys(tree) : [];

    const handleSync = () => {
        setIsSyncing(true);
        router.post(
            "/sekali-products/sync",
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsSyncing(false),
            },
        );
    };

    // breadcrumb index clicked -> jump back to that level
    const goToLevel = (level) => {
        if (level === 0) {
            setSelectedCategory(null);
            setSelectedGame(null);
        } else if (level === 1) {
            setSelectedGame(null);
        }
    };

    return (
        <div>
            <Head title="SekalıPay Mahsulotlari" />
            <div className="p-3 sm:p-4 md:p-6 max-w-5xl mx-auto">
                {/* Header - always visible */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            SekalıPay Mahsulotlari
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            IDR kursi:{" "}
                            {idr_rate
                                ? `1 IDR = ${Number(idr_rate).toLocaleString()} UZS`
                                : "Kiritilmagan"}
                        </p>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors"
                    >
                        <RefreshCw
                            className={`size-4 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        {isSyncing ? "Sync..." : "SekalıPay Sync"}
                    </button>
                </div>

                {flash?.success && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
                        {flash.success}
                    </div>
                )}

                {/* Screen 1: category list */}
                {!selectedCategory && (
                    <>
                        <GlobalSearch
                            tree={tree}
                            categories={categories}
                            onJump={(category, game) => {
                                setSelectedCategory(category);
                                setSelectedGame(game);
                            }}
                        />
                        <p className="text-xs text-slate-400 mb-4">
                            Kategoriyaga bosing → O'yin/xizmatni tanlang →
                            Server bo'yicha narx va ustama belgilang
                        </p>
                        <CategoryList
                            categories={categories}
                            tree={tree}
                            onSelectCategory={setSelectedCategory}
                        />
                    </>
                )}

                {/* Screen 2: games inside selected category */}
                {selectedCategory && !selectedGame && (
                    <CategoryPage
                        category={selectedCategory}
                        games={tree[selectedCategory] ?? []}
                        onSelectGame={setSelectedGame}
                        onBack={goToLevel}
                        topGames={topGames}
                        onTopToggle={handleTopToggle}
                        gameVisibility={initialGameVis[selectedCategory] ?? {}}
                    />
                )}

                {/* Screen 3: variants inside selected game */}
                {selectedCategory && selectedGame && (
                    <GamePage
                        category={selectedCategory}
                        game={selectedGame}
                        idrRate={idr_rate}
                        onBack={() => setSelectedGame(null)}
                        onBreadcrumb={goToLevel}
                    />
                )}
            </div>
        </div>
    );
}
