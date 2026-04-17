import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import { CheckCircle, Clock, Receipt, XCircle } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "../../Components/Sidebar";

const STATUS_LABEL = {
    pending:  { text: "Kutilmoqda",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    approved: { text: "Tasdiqlandi",  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    rejected: { text: "Rad etildi",   cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
};

export default function ManualTopups({ requests = [], pending = 0 }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rejectId, setRejectId]       = useState(null);
    const [rejectNote, setRejectNote]   = useState("");
    const [loadingId, setLoadingId]     = useState(null);
    const [lightbox, setLightbox]       = useState(null);

    const approve = async (id) => {
        if (!confirm("So'rovni tasdiqlashni xohlaysizmi?")) return;
        setLoadingId(id);
        try {
            await axios.post(`/manual-topups/${id}/approve`);
            router.reload({ only: ["requests", "pending"] });
        } catch (e) {
            alert(e.response?.data?.message ?? "Xatolik yuz berdi");
        } finally {
            setLoadingId(null);
        }
    };

    const openReject = (id) => {
        setRejectId(id);
        setRejectNote("");
    };

    const submitReject = async () => {
        if (!rejectId) return;
        setLoadingId(rejectId);
        try {
            await axios.post(`/manual-topups/${rejectId}/reject`, { notes: rejectNote });
            setRejectId(null);
            router.reload({ only: ["requests", "pending"] });
        } catch (e) {
            alert(e.response?.data?.message ?? "Xatolik yuz berdi");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <>
            <Head title="Manual Topuplar" />

            {/* Reject modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-3">
                            Rad etish sababi (ixtiyoriy)
                        </h3>
                        <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            rows={3}
                            placeholder="Masalan: chek noto'g'ri, summa mos emas..."
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-sm bg-transparent dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setRejectId(null)}
                                className="flex-1 h-10 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white text-sm font-semibold"
                            >
                                Bekor
                            </button>
                            <button
                                onClick={submitReject}
                                disabled={!!loadingId}
                                className="flex-1 h-10 rounded-xl bg-rose-500 text-white text-sm font-semibold disabled:opacity-50"
                            >
                                {loadingId ? "..." : "Rad etish"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setLightbox(null)}
                >
                    <img
                        src={lightbox}
                        alt="Chek"
                        className="max-w-full max-h-full rounded-xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 p-4 md:p-8 overflow-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            className="md:hidden p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="block w-5 h-0.5 bg-slate-700 dark:bg-white mb-1" />
                            <span className="block w-5 h-0.5 bg-slate-700 dark:bg-white mb-1" />
                            <span className="block w-5 h-0.5 bg-slate-700 dark:bg-white" />
                        </button>

                        <div className="flex items-center gap-3">
                            <Receipt className="size-6 text-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                                    Manual Topuplar
                                </h1>
                                {pending > 0 && (
                                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                        {pending} ta so'rov ko'rib chiqilishini kutmoqda
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {requests.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
                            Hozircha so'rovlar yo'q
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">#</th>
                                            <th className="px-4 py-3 text-left font-semibold">Foydalanuvchi</th>
                                            <th className="px-4 py-3 text-left font-semibold">Summa</th>
                                            <th className="px-4 py-3 text-left font-semibold">Chek</th>
                                            <th className="px-4 py-3 text-left font-semibold">Sana</th>
                                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                                            <th className="px-4 py-3 text-left font-semibold">Izoh</th>
                                            <th className="px-4 py-3 text-left font-semibold">Amallar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {requests.map((r) => {
                                            const s = STATUS_LABEL[r.status] ?? {
                                                text: r.status,
                                                cls: "bg-slate-100 text-slate-600",
                                            };
                                            const isPending = r.status === "pending";
                                            const busy = loadingId === r.id;

                                            return (
                                                <tr
                                                    key={r.id}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                        {r.id}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                                                        {r.username}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                        {Number(r.amount).toLocaleString("fr-FR")} UZS
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => setLightbox(r.receipt_url)}
                                                            className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 w-14 h-14 flex-shrink-0"
                                                        >
                                                            <img
                                                                src={r.receipt_url}
                                                                alt="Chek"
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                            />
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3 shrink-0" />
                                                            {new Date(r.created_at).toLocaleString("ru-RU")}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.cls}`}>
                                                            {s.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[160px]">
                                                        {r.notes ?? "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {isPending ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => approve(r.id)}
                                                                    disabled={busy}
                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                                                                >
                                                                    <CheckCircle className="size-3.5" />
                                                                    Tasdiqlash
                                                                </button>
                                                                <button
                                                                    onClick={() => openReject(r.id)}
                                                                    disabled={busy}
                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                                                                >
                                                                    <XCircle className="size-3.5" />
                                                                    Rad etish
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 dark:text-slate-500 text-xs">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
