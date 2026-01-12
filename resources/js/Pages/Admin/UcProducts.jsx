import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function UcProducts() {
    const { products, flash } = usePage().props;
    const [editing, setEditing] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy, // 👈 nomini destroy deb oldik
        processing,
        reset,
        errors,
    } = useForm({
        title: "",
        uc_amount: "",
        sell_price: "",
        cost_price: "",
        cost_currency: "",
    });

    // ✏️ Edit bosilganda
    const editProduct = (product) => {
        setEditing(product.id);
        setData({
            title: product.title,
            uc_amount: product.uc_amount,
            sell_price: product.sell_price,
            cost_price: product.cost_price,
            cost_currency: product.cost_currency,
        });
    };
    const deleteProduct = (id) => {
        if (!confirm("Rostdan ham o‘chirmoqchimisiz?")) return;

        destroy(route("uc-products.destroy", id));
    };

    // ✅ YAGONA SUBMIT
    const submit = (e) => {
        e.preventDefault();

        if (editing) {
            // UPDATE
            put(route("uc-products.update", editing), {
                onSuccess: () => {
                    reset();
                    setEditing(null);
                },
            });
        } else {
            // CREATE
            post(route("uc-products.store"), {
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold">🎮 UC Products</h1>

            {flash?.success && (
                <div className="p-3 bg-green-100 text-green-700 rounded">
                    {flash.success}
                </div>
            )}

            {/* LIST */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2">ID</th>
                            <th>Nomi</th>
                            <th>UC</th>
                            <th>Sotuv (UZS)</th>
                            <th>Tan narx</th>
                            <th>Holat</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length ? (
                            products.map((p) => (
                                <tr key={p.id} className="border-t">
                                    <td className="p-2">{p.id}</td>
                                    <td>{p.title}</td>
                                    <td>{p.uc_amount}</td>
                                    <td>{Number(p.sell_price).toLocaleString()}</td>
                                    <td>
                                        {p.cost_price} {p.cost_currency}
                                    </td>
                                    <td>
                                        {p.is_active ? (
                                            <span className="text-green-600">Aktiv</span>
                                        ) : (
                                            <span className="text-red-500">Noaktiv</span>
                                        )}
                                    </td>
                                    <td className="space-x-2">
                                        <button
                                            onClick={() => editProduct(p)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteProduct(p.id)}
                                            className="text-red-600 hover:underline"
                                            disabled={processing}
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="p-4 text-center text-gray-500">
                                    Mahsulot yo‘q
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* FORM */}
            <div className="bg-white p-6 rounded shadow max-w-md">
                <h2 className="text-lg font-semibold mb-4">
                    {editing ? "✏️ UC tahrirlash" : "➕ Yangi UC qo‘shish"}
                </h2>

                <form onSubmit={submit} className="space-y-3">
                    <input
                        className="input"
                        placeholder="Masalan: 60 UC"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                    />
                    {errors.title && (
                        <div className="text-red-500">{errors.title}</div>
                    )}

                    <input
                        className="input"
                        type="number"
                        placeholder="UC miqdori"
                        value={data.uc_amount}
                        onChange={(e) => setData("uc_amount", e.target.value)}
                    />

                    <input
                        className="input"
                        type="number"
                        placeholder="Sotuv narxi (UZS)"
                        value={data.sell_price}
                        onChange={(e) => setData("sell_price", e.target.value)}
                    />

                    <input
                        className="input"
                        type="number"
                        placeholder="Tan narx"
                        value={data.cost_price}
                        onChange={(e) => setData("cost_price", e.target.value)}
                    />

                    <select
                        className="input"
                        value={data.cost_currency}
                        onChange={(e) => setData("cost_currency", e.target.value)}
                    >
                        <option value="">Valyuta tanlang</option>
                        <option value="USD">USD</option>
                        <option value="IQD">IQD</option>
                    </select>

                    <button
                        disabled={processing}
                        className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        {editing ? "Yangilash" : "Saqlash"}
                    </button>
                </form>
            </div>
        </div>
    );
}
