import { useForm, usePage } from "@inertiajs/react";
import { Plus, Settings } from "lucide-react";
import { useState } from "react";
import SpinTopBar from "../../Components/ui/SpinTopBar";

export default function SpinRules() {
    const { rules, flash } = usePage().props;
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
    } = useForm({
        min_total_deposit: "",
        spins_count: "",
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();

        if (editing) {
            put(route("spin-rules.update", editing), {
                onSuccess: () => {
                    reset();
                    setEditing(null);
                },
            });
        } else {
            post(route("spin-rules.store"), {
                onSuccess: () => reset(),
            });
        }
    };

    const editRule = (r) => {
        setEditing(r.id);
        setData({
            min_total_deposit: r.min_total_deposit,
            spins_count: r.spins_count,
            is_active: r.is_active,
        });
    };

    const deleteRule = (id) => {
        if (!confirm("O‘chirmoqchimisiz?")) return;
        destroy(route("spin-rules.destroy", id));
    };

    return (
        <div className="p-0 md:p-6 space-y-8 bg-transparent min-h-screen">
            <SpinTopBar />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                        Spin Rules
                    </h3>
                    <p className="text-sm text-gray-500">
                        Configure spin system rules
                    </p>
                </div>
            </div>

            {/* Status */}
            <div className="flex flex-col sm:flex-row gap-3">
                <span className="w-full sm:w-auto text-center px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                    Spin System: Enabled
                </span>

                <button className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg">
                    Disable
                </button>
            </div>

            {/* Default Rules */}
            <div className="bg-white rounded-xl shadow p-5">
                <p className="text-sm text-gray-500">
                    Minimum Balance Required
                </p>

                <p className="text-3xl font-bold mt-1">1000 UZS</p>

                <p className="text-xs text-gray-400 mt-2">
                    Required to use spin
                </p>
            </div>

            {/* Custom Rules */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="text-lg font-semibold">Custom Rules</h4>
                <button
                    onClick={() => {
                        reset();
                        setEditing(null);
                        setShowModal(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    <Plus className="w-4 h-4" />
                    Add Custom Rule
                </button>
            </div>

            {rules.length === 0 && (
                <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
                    No custom rules added yet. Click “Add Custom Rule” to create
                    one.
                </div>
            )}

            {/* Flash */}
            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-3 rounded-lg">
                    {flash.success}
                </div>
            )}

            {/* Table */}
            {rules.length > 0 && (
                <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    Minimal to‘lov (UZS)
                                </th>
                                <th className="px-4 py-3 text-left">
                                    Spin soni
                                </th>
                                <th className="px-4 py-3 text-left">Holat</th>
                                <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3">
                                        {Number(
                                            r.min_total_deposit,
                                        ).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.spins_count}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${
                                                r.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-200 text-gray-600"
                                            }`}
                                        >
                                            {r.is_active ? "Aktiv" : "Noaktiv"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 space-x-3">
                                        <button
                                            onClick={() => {
                                                editRule(r);
                                                setShowModal(true);
                                            }}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteRule(r.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MOBILE */}
            <div className="space-y-4 sm:hidden">
                {rules.map((r) => (
                    <div
                        key={r.id}
                        className="bg-white rounded-xl shadow p-4 space-y-3"
                    >
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                                Min Deposit
                            </span>
                            <span className="font-medium">
                                {Number(r.min_total_deposit).toLocaleString()}{" "}
                                UZS
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Spins</span>
                            <span>{r.spins_count}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className={`px-2 py-1 rounded text-xs ${
                                    r.is_active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                {r.is_active ? "Active" : "Inactive"}
                            </span>

                            <div className="flex gap-3">
                                <button className="text-blue-600 text-sm">
                                    Edit
                                </button>
                                <button className="text-red-600 text-sm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">
                                {editing ? "Edit Spin Rule" : "Add Spin Rule"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                submit(e);
                                setShowModal(false);
                            }}
                            className="px-6 py-5 space-y-4"
                        >
                            <div>
                                <label className="text-sm text-gray-600">
                                    Minimum Deposit (UZS)
                                </label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    value={data.min_total_deposit}
                                    onChange={(e) =>
                                        setData(
                                            "min_total_deposit",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">
                                    Spin Count
                                </label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    value={data.spins_count}
                                    onChange={(e) =>
                                        setData("spins_count", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData("is_active", e.target.checked)
                                    }
                                />
                                Active rule
                            </label>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editing ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
