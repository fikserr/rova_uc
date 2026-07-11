import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    ChevronDown, ChevronRight, Loader2, RefreshCw, Save, X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";

const CATEGORY_COLORS = {
    "Game":                    "from-violet-500 to-purple-600",
    "Aplikasi Premium":        "from-blue-500 to-indigo-600",
    "E-Wallet":                "from-emerald-500 to-teal-600",
    "SMM":                     "from-pink-500 to-rose-600",
    "Top Up & Digital Services": "from-amber-500 to-orange-600",
    "Tagihan":                 "from-slate-500 to-gray-600",
    "Voucher":                 "from-cyan-500 to-sky-600",
};

function catColor(cat) {
    return CATEGORY_COLORS[cat] ?? "from-slate-400 to-slate-600";
}

function VariantRow({ product, idrRate, onSaved }) {
    const [editing, setEditing]   = useState(false);
    const [priceUzs, setPriceUzs] = useState(String(product.price_uzs));
    const [active, setActive]     = useState(product.is_active);
    const [saving, setSaving]     = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const res = await axios.put(`/sekali-products/${product.id}`, {
                price_uzs: parseInt(priceUzs),
                is_active: active,
            });
            onSaved(res.data.product);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0">
            <td className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 max-w-56 truncate">
                {product.name}
            </td>
            <td className="px-4 py-2.5 text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                {Number(product.price_idr).toLocaleString()}
            </td>
            <td className="px-4 py-2.5 text-right">
                {editing ? (
                    <input
                        type="number"
                        value={priceUzs}
                        onChange={e => setPriceUzs(e.target.value)}
                        min="100"
                        step="1000"
                        className="w-28 text-right px-2 py-1 rounded-lg border border-violet-300 dark:border-violet-600 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                ) : (
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {Number(product.price_uzs).toLocaleString()}
                    </span>
                )}
            </td>
            <td className="px-4 py-2.5 text-center text-xs text-slate-400">
                {Number(product.markup_percent).toFixed(1)}%
            </td>
            <td className="px-4 py-2.5 text-center">
                {editing ? (
                    <button
                        onClick={() => setActive(a => !a)}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700"}`}
                    >
                        {active ? "Aktiv" : "Yopiq"}
                    </button>
                ) : (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700"}`}>
                        {product.is_active ? "Aktiv" : "Yopiq"}
                    </span>
                )}
            </td>
            <td className="px-4 py-2.5 text-center">
                {editing ? (
                    <div className="flex items-center justify-center gap-1.5">
                        <button onClick={save} disabled={saving}
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50">
                            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                        </button>
                        <button onClick={() => { setEditing(false); setPriceUzs(String(product.price_uzs)); setActive(product.is_active); }}
                            className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                            <X className="size-3.5" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setEditing(true)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                        Tahrir
                    </button>
                )}
            </td>
        </tr>
    );
}

function TypeSection({ typeName, products: initProducts, idrRate, markup, onBulkApply }) {
    const [products, setProducts] = useState(initProducts);
    const [bulkMarkup, setBulkMarkup]   = useState(markup);
    const [applying, setApplying]       = useState(false);

    const handleSaved = (updated) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
    };

    const applyBulk = async () => {
        setApplying(true);
        try {
            await onBulkApply(bulkMarkup, typeName);
            // Refresh prices locally
            setProducts(prev => prev.map(p => {
                const cost = p.price_idr * idrRate;
                return { ...p, markup_percent: bulkMarkup, price_uzs: Math.ceil(cost * (1 + bulkMarkup / 100)) };
            }));
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="mb-3">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-700/60 rounded-lg mb-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    {typeName} <span className="font-normal text-slate-400">({products.length})</span>
                </span>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={bulkMarkup}
                        onChange={e => setBulkMarkup(parseFloat(e.target.value) || 0)}
                        min="0" max="500"
                        className="w-16 text-right px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <span className="text-xs text-slate-400">%</span>
                    <button onClick={applyBulk} disabled={applying}
                        className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-semibold disabled:opacity-50 flex items-center gap-1">
                        {applying ? <Loader2 className="size-3 animate-spin" /> : null}
                        Qo'lla
                    </button>
                </div>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs text-slate-400 uppercase">
                        <th className="text-left px-4 py-1.5">Variant</th>
                        <th className="text-right px-4 py-1.5">IDR</th>
                        <th className="text-right px-4 py-1.5">UZS narx</th>
                        <th className="text-center px-4 py-1.5">Foyda%</th>
                        <th className="text-center px-4 py-1.5">Holat</th>
                        <th className="text-center px-4 py-1.5">Amal</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <VariantRow key={p.id} product={p} idrRate={idrRate} onSaved={handleSaved} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function GamePanel({ category, game, idrRate, defaultMarkup }) {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(false);
    const loaded                = useRef(false);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;
        setLoading(true);
        axios.get('/sekali-products/variants', { params: { category, game } })
            .then(r => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    const handleBulkApply = async (markup, productType) => {
        await axios.post('/sekali-products/bulk-markup', {
            markup_percent: markup,
            category,
            game,
            product_type: productType === 'Standard' ? null : productType,
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center py-10">
            <Loader2 className="size-6 animate-spin text-violet-500" />
        </div>
    );
    if (!data) return null;

    const { grouped, types } = data;

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                    Jami: <strong>{data.total}</strong> variant, <strong>{types.length}</strong> server/tur
                </span>
            </div>
            <div className="p-4">
                {types.map(type => (
                    <TypeSection
                        key={type}
                        typeName={type}
                        products={grouped[type] ?? []}
                        idrRate={idrRate}
                        markup={defaultMarkup}
                        onBulkApply={handleBulkApply}
                    />
                ))}
            </div>
        </div>
    );
}

function GameRow({ category, game, idrRate, defaultMarkup }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
            >
                <span className="font-semibold text-slate-800 dark:text-white text-sm">{game}</span>
                {open
                    ? <ChevronDown className="size-4 text-slate-400" />
                    : <ChevronRight className="size-4 text-slate-400" />}
            </button>
            {open && (
                <div className="border-t border-slate-100 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-900/30">
                    <GamePanel category={category} game={game} idrRate={idrRate} defaultMarkup={defaultMarkup} />
                </div>
            )}
        </div>
    );
}

function CategorySection({ category, games, idrRate, defaultMarkup }) {
    const [open, setOpen] = useState(false);
    const color = catColor(category);

    return (
        <div className="mb-4 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 px-5 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors text-left"
            >
                <div className={`size-9 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shrink-0`}>
                    <span className="text-white font-bold text-sm">{category.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white">{category}</p>
                    <p className="text-xs text-slate-400">{games.length} ta mahsulot/o'yin</p>
                </div>
                {open
                    ? <ChevronDown className="size-5 text-slate-400" />
                    : <ChevronRight className="size-5 text-slate-400" />}
            </button>
            {open && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/20">
                    {games.map(game => (
                        <GameRow key={game} category={category} game={game} idrRate={idrRate} defaultMarkup={20} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SekaliProducts() {
    const { tree, idr_rate, flash } = usePage().props;
    const [isSyncing, setIsSyncing] = useState(false);

    const categories = tree ? Object.keys(tree) : [];

    const handleSync = () => {
        setIsSyncing(true);
        router.post("/sekali-products/sync", {}, {
            preserveScroll: true,
            onFinish: () => setIsSyncing(false),
        });
    };

    return (
        <AdminLayout>
            <Head title="SekalıPay Mahsulotlari" />
            <div className="p-4 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SekalıPay Mahsulotlari</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            IDR kursi: {idr_rate ? `1 IDR = ${Number(idr_rate).toLocaleString()} UZS` : "Kiritilmagan"}
                        </p>
                    </div>
                    <button onClick={handleSync} disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors">
                        <RefreshCw className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Sync..." : "SekalıPay Sync"}
                    </button>
                </div>

                {flash?.success && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
                        {flash.success}
                    </div>
                )}

                <p className="text-xs text-slate-400 mb-4">
                    Kategoriyaga bosing → O'yin/xizmatga bosing → Server bo'yicha narx va ustama belgilang
                </p>

                {categories.map(cat => (
                    <CategorySection
                        key={cat}
                        category={cat}
                        games={tree[cat] ?? []}
                        idr_rate={idr_rate}
                        idrRate={idr_rate}
                        defaultMarkup={20}
                    />
                ))}
            </div>
        </AdminLayout>
    );
}
