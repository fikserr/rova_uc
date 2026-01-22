import AdminLayout from "@/Components/Layout/AdminLayout";
import { useForm, usePage } from "@inertiajs/react";
import { Edit2, Palette, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import SpinTopBar from "../../Components/ui/SpinTopBar";

export default function SpinSectors() {
    const { sectors, flash } = usePage().props;
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        title: "",
        reward_type: "balance",
        reward_value: "",
        probability: "",
        is_active: true,
    });

    // ✏️ Edit
    const editSector = (s) => {
        setEditing(s.id);
        setData({
            title: s.title,
            reward_type: s.reward_type,
            reward_value: s.reward_value,
            probability: s.probability,
            is_active: s.is_active,
        });
        setShowModal(true);
    };

    // 💾 Submit
    const submit = (e) => {
        e.preventDefault();

        if (data.reward_type === "none") {
            data.reward_value = 0;
        }

        if (editing) {
            put(route("spin-sectors.update", editing), {
                onSuccess: () => {
                    reset();
                    setEditing(null);
                    setShowModal(false);
                },
            });
        } else {
            post(route("spin-sectors.store"), {
                onSuccess: () => {
                    reset();
                    setShowModal(false);
                },
            });
        }
    };

    // 🗑 Delete
    const deleteSector = (id) => {
        if (!confirm("Spin sektorni o‘chirmoqchimisiz?")) return;
        destroy(route("spin-sectors.destroy", id));
    };

    const totalProbability = sectors
        .filter((s) => s.is_active)
        .reduce((sum, s) => sum + Number(s.probability), 0);

    return (
        <div className="p-0 md:p-6 space-y-8">
            <SpinTopBar />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Palette className="w-6 h-6" />
                        Spin Sectors
                    </h2>
                    <p className="text-sm text-gray-500">
                        Configure spin wheel sectors
                    </p>
                </div>
                <button
                    onClick={() => {
                        reset();
                        setEditing(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Add Sector
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Stat label="Total Sectors" value={sectors.length} />
                <Stat
                    label="Active Sectors"
                    value={sectors.filter((s) => s.is_active).length}
                    color="text-green-600"
                />
                <Stat
                    label="Total Probability"
                    value={`${totalProbability}%`}
                    color={
                        totalProbability === 100
                            ? "text-green-600"
                            : "text-red-600"
                    }
                />
            </div>

            {totalProbability !== 100 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm text-red-700">
                    ⚠️ Total probability must be exactly 100%
                </div>
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectors.map((s) => (
                    <div
                        key={s.id}
                        className={`bg-white p-6 rounded-lg border-2 transition ${
                            s.is_active
                                ? "border-green-200"
                                : "border-gray-200 opacity-60"
                        }`}
                    >
                        <div className="flex justify-between mb-4">
                            <div>
                                <h3 className="font-semibold">{s.title}</h3>
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                                    {s.reward_type}
                                </span>
                            </div>
                            <button
                                onClick={() => editSector(s)}
                                className="text-blue-600"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <Row
                                label="Reward"
                                value={
                                    s.reward_type === "none"
                                        ? "None"
                                        : s.reward_value
                                }
                            />
                            <Row
                                label="Probability"
                                value={`${s.probability}%`}
                            />
                            <div className="h-2 bg-gray-200 rounded">
                                <div
                                    className="h-2 bg-blue-600 rounded"
                                    style={{
                                        width: `${s.probability}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => deleteSector(s.id)}
                                className="text-red-500 text-sm"
                                disabled={processing}
                            >
                                Delete
                            </button>
                            {s.is_active ? (
                                <ToggleRight className="text-green-600" />
                            ) : (
                                <ToggleLeft className="text-gray-400" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <form
                        onSubmit={submit}
                        className="bg-white rounded-2xl w-full max-w-md p-6 space-y-6 shadow-lg"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editing
                                    ? "Edit Spin Sector"
                                    : "Add Spin Sector"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Title */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                                Sector Title
                            </label>
                            <input
                                className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="e.g. 5000 UZS"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                            />
                            {errors.title && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Reward Type */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                                Reward Type
                            </label>
                            <select
                                className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                value={data.reward_type}
                                onChange={(e) =>
                                    setData("reward_type", e.target.value)
                                }
                            >
                                <option value="balance">💰 Balance</option>
                                <option value="pubg">🎮 PUBG UC</option>
                                <option value="none">❌ No reward</option>
                            </select>
                        </div>

                        {/* Reward Value */}
                        {data.reward_type !== "none" && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    Reward Value
                                </label>
                                <input
                                    type="number"
                                    className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="Enter value"
                                    value={data.reward_value}
                                    onChange={(e) =>
                                        setData("reward_value", e.target.value)
                                    }
                                />
                            </div>
                        )}

                        {/* Probability */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                                Probability (%)
                            </label>
                            <input
                                type="number"
                                className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="0 - 100"
                                value={data.probability}
                                onChange={(e) =>
                                    setData("probability", e.target.value)
                                }
                            />
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                            <span className="text-sm font-medium text-gray-700">
                                Active Sector
                            </span>
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData("is_active", e.target.checked)
                                }
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={processing}
                                className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                            >
                                {editing ? "Update Sector" : "Save Sector"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

const Stat = ({ label, value, color = "text-gray-900" }) => (
    <div className="bg-white p-4 rounded-lg border">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

const Row = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium">{value}</span>
    </div>
);

SpinSectors.layout = (page) => <AdminLayout>{page}</AdminLayout>;
