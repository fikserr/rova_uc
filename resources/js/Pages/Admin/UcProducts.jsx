import AdminLayout from "@/Components/Layout/AdminLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import TopBar from "../../Components/TopBar";
import ProductCard from "../../Components/ui/productCard";
export default function UcProducts() {
    const { products, flash } = usePage().props;
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);

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
        is_active: true,
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
            is_active: product.is_active,
        });
        setFormOpen(true); // <-- show modal
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
                    setFormOpen(false);
                },
            });
        } else {
            // CREATE
            post(route("uc-products.store"), {
                onSuccess: () => {
                    reset();
                    setEditing(null);
                    setFormOpen(false); // 👈 close modal
                },
            });
        }
    };

    return (
        <div className="p-6 space-y-8">
            <Head>
                <title>Pubg Mobile UC</title>
                <meta name="description" content="Your page description" />
            </Head>
            <TopBar
                pageFor={"uc"}
                setEditing={setEditing}
                setFormOpen={setFormOpen}
                reset={reset}
            />
            {flash?.success && (
                <div className="p-3 bg-green-100 text-green-700 rounded">
                    {flash.success}
                </div>
            )}

            {/* LIST */}

            <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {products.length &&
                    products.map((product) => {
                        return (
                            <ProductCard
                                cardFor={"uc"}
                                key={product.id}
                                product={product}
                                onEdit={editProduct}
                                onDelete={deleteProduct}
                            />
                        );
                    })}
            </div>

            {/* FORM */}
            {formOpen && (
                <div
                    onClick={() => setFormOpen(false)} // click outside closes modal
                    className="w-full h-full fixed top-0 left-0 bg-black/40 flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded shadow w-full max-w-lg"
                    >
                        <h2 className="text-lg font-semibold mb-5">
                            {editing
                                ? "✏️ UC tahrirlash"
                                : "➕ Yangi UC qo‘shish"}
                        </h2>
                        <form onSubmit={submit} className="w-full space-y-4">
                            <div className="w-full flex items-center justify-between">
                                <span className="text-lg font-mono">
                                    Mahsulot nomi :
                                </span>
                                <input
                                    className="input w-1/2 border-b-2 px-3 pb-1 outline-0"
                                    placeholder="Masalan: 60 UC"
                                    value={data.title}
                                    required
                                    onChange={(e) =>
                                        setData("title", e.target.value)
                                    }
                                />
                                {errors.title && (
                                    <div className="text-red-500">
                                        {errors.title}
                                    </div>
                                )}
                            </div>
                            <div className="w-full flex items-center justify-between">
                                <span className="text-lg font-mono">
                                    UC Miqdori :
                                </span>
                                <input
                                    className="input w-1/2 border-b-2 px-3 pb-1 outline-0"
                                    type="number"
                                    placeholder="Masalan: 60"
                                    value={data.uc_amount}
                                    required
                                    onChange={(e) =>
                                        setData("uc_amount", e.target.value)
                                    }
                                />
                            </div>
                            <div className="w-full flex items-center justify-between">
                                <span className="text-lg font-mono">
                                    Sotuv narxi (UZS) :
                                </span>
                                <input
                                    className="input w-1/2 border-b-2 px-3 pb-1 outline-0"
                                    type="number"
                                    placeholder=""
                                    value={data.sell_price}
                                    required
                                    onChange={(e) =>
                                        setData("sell_price", e.target.value)
                                    }
                                />
                            </div>
                            <div className="w-full flex items-center justify-between">
                                <span className="text-lg font-mono">
                                    Tan narxi :
                                </span>
                                <input
                                    className="input w-1/2 border-b-2 px-3 pb-1 outline-0"
                                    type="number"
                                    placeholder=""
                                    value={data.cost_price}
                                    required
                                    onChange={(e) =>
                                        setData("cost_price", e.target.value)
                                    }
                                />
                            </div>
                            <div className="w-full flex items-center justify-between">
                                <span className="text-lg font-mono">
                                    Valyuta :
                                </span>
                                <select
                                    className="input w-1/2 pb-1 outline-0 border-b-2"
                                    value={data.cost_currency}
                                    onChange={(e) =>
                                        setData("cost_currency", e.target.value)
                                    }
                                >
                                    <option value="none">
                                        Valyuta tanlang
                                    </option>
                                    <option value="USD">USD</option>
                                    <option value="UZS">UZS</option>
                                    <option value="IQD">IQD</option>
                                </select>
                            </div>
                            <label className="flex gap-2 items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData("is_active", e.target.checked)
                                    }
                                />
                                Aktiv
                            </label>
                            <button
                                disabled={processing}
                                className="w-full bg-blue-600 text-white py-2 rounded"
                            >
                                {editing ? "Yangilash" : "Saqlash"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
UcProducts.layout = (page) => <AdminLayout>{page}</AdminLayout>;
