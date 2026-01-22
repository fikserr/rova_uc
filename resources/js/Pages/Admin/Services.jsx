import AdminLayout from "@/Components/Layout/AdminLayout";
import { useForm, usePage , Head } from "@inertiajs/react";
import { useState } from "react";
import TopBar from "../../Components/TopBar";
import ProductCard from "../../Components/ui/productCard";
export default function Services() {
    const { services, flash } = usePage().props;
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [choosedServiceType, setChoosedServiceType] = useState("stars");
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
        service_type: "stars",
        value: "",
        sell_price: "",
        cost_price: "",
        cost_currency: "USD",
    });

    const editService = (service) => {
        setEditing(service.id);
        setData({
            title: service.title,
            service_type: service.service_type,
            value: service.value,
            sell_price: service.sell_price,
            cost_price: service.cost_price,
            cost_currency: service.cost_currency,
            is_active: service.is_active,
        });
        setFormOpen(true); // ✅ MUHIM
    };

    const deleteService = (id) => {
        if (!confirm("O‘chirmoqchimisiz?")) return;
        destroy(route("services.destroy", id));
    };

    const submit = (e) => {
        e.preventDefault();

        if (editing) {
            put(route("services.update", editing), {
                onSuccess: () => {
                    reset();
                    setEditing(null);
                    setFormOpen(false);
                },
            });
        } else {
            post(route("services.store"), {
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
                <title>Telegram Services</title>
                <meta name="description" content="Your page description" />
            </Head>
            <TopBar
                pageFor="services"
                setEditing={setEditing} // ✅ faqat state setter
                setFormOpen={setFormOpen}
                reset={reset}
            />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-3 rounded">
                    {flash.success}
                </div>
            )}

            {/* LIST */}
            {/* <table className="w-full bg-white shadow text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Sotuv (UZS)</th>
                        <th>Tan narx</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((s) => (
                        <tr key={s.id} className="border-t">
                            <td>{s.title}</td>
                            <td>{s.service_type}</td>
                            <td>{s.value}</td>
                            <td>{s.sell_price}</td>
                            <td>
                                {s.cost_price} {s.cost_currency}
                            </td>
                            <td className="space-x-2">
                                <button
                                    onClick={() => editService(s)}
                                    className="text-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteService(s.id)}
                                    className="text-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {services.length &&
                    services.map((service) => {
                        return (
                            <ProductCard
                                cardFor={"services"}
                                key={service.id}
                                product={service}
                                onEdit={editService}
                                onDelete={deleteService}
                            />
                        );
                    })}
            </div>

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
                                ? "✏️ Service tahrirlash"
                                : "➕ Service qo‘shish"}
                        </h2>
                        <form onSubmit={submit} className="w-full space-y-4">
                            <div className="w-full flex items-center justify-between">
                                <span className="text-lg font-mono">
                                    Mahsulot turi :
                                </span>
                                <select
                                    className="input w-1/2 border-b-2 px-3 pb-1 outline-0"
                                    value={data.service_type}
                                    onChange={(e) => {
                                        setData("service_type", e.target.value);
                                        setChoosedServiceType(e.target.value);
                                    }}
                                >
                                    <option value="stars">Stars</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                            <div className="w-full flex items-center justify-between">
                                <span className="text-lg font-mono">
                                    Mahsulot nomi :
                                </span>
                                <input
                                    className="input w-1/2 border-b-2 px-3 pb-1 outline-0 "
                                    placeholder=""
                                    value={data.title}
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
                                    {choosedServiceType === "stars"
                                        ? "Stars miqdori :"
                                        : "Premimum muddati (oy) :"}
                                </span>
                                <input
                                    className="input w-1/2 border-b-2 px-3 pb-1 outline-0"
                                    type="number"
                                    placeholder=""
                                    value={data.value}
                                    onChange={(e) =>
                                        setData("value", e.target.value)
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
                                    className="input w-1/2 border-b-2 px-3 pb-1 outline-0"
                                    value={data.cost_currency}
                                    onChange={(e) =>
                                        setData("cost_currency", e.target.value)
                                    }
                                >
                                    <option value="USD">USD</option>
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
Services.layout = (page) => <AdminLayout>{page}</AdminLayout>;
