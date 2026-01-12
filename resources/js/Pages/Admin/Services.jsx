import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Services() {
  const { services, flash } = usePage().props;
  const [editing, setEditing] = useState(null);

  const { data, setData, post, put, delete: destroy, reset } = useForm({
    title: "",
    service_type: "stars",
    value: "",
    sell_price: "",
    cost_price: "",
    cost_currency: "USD",
  });

  const submit = (e) => {
    e.preventDefault();

    if (editing) {
      put(route("services.update", editing), {
        onSuccess: () => {
          reset();
          setEditing(null);
        },
      });
    } else {
      post(route("services.store"), {
        onSuccess: () => reset(),
      });
    }
  };

  const editService = (s) => {
    setEditing(s.id);
    setData({
      title: s.title,
      service_type: s.service_type,
      value: s.value,
      sell_price: s.sell_price,
      cost_price: s.cost_price,
      cost_currency: s.cost_currency,
    });
  };

  const deleteService = (id) => {
    if (!confirm("O‘chirmoqchimisiz?")) return;
    destroy(route("services.destroy", id));
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">⭐ Telegram Services</h1>

      {flash?.success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {flash.success}
        </div>
      )}

      {/* LIST */}
      <table className="w-full bg-white shadow text-sm">
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
      </table>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow max-w-md">
        <h2 className="font-semibold mb-3">
          {editing ? "✏️ Service tahrirlash" : "➕ Service qo‘shish"}
        </h2>

        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="Title"
            value={data.title}
            onChange={(e) => setData("title", e.target.value)}
          />

          <select
            className="input"
            value={data.service_type}
            onChange={(e) => setData("service_type", e.target.value)}
          >
            <option value="stars">Stars</option>
            <option value="premium">Premium</option>
          </select>

          <input
            className="input"
            type="number"
            placeholder="Stars soni yoki oy"
            value={data.value}
            onChange={(e) => setData("value", e.target.value)}
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
            <option value="USD">USD</option>
            <option value="IQD">IQD</option>
          </select>

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Saqlash
          </button>
        </form>
      </div>
    </div>
  );
}
