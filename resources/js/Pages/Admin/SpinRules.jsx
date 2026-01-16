import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from '@/Components/Layout/AdminLayout'
export default function SpinRules() {
  const { rules, flash } = usePage().props;
  const [editing, setEditing] = useState(null);

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
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">🎯 Spin qoidalari</h1>

      {flash?.success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {flash.success}
        </div>
      )}

      <table className="w-full bg-white shadow text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th>Minimal to‘lov (UZS)</th>
            <th>Spin soni</th>
            <th>Holat</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} className="border-t">
              <td>{Number(r.min_total_deposit).toLocaleString()}</td>
              <td>{r.spins_count}</td>
              <td>{r.is_active ? "Aktiv" : "Noaktiv"}</td>
              <td className="space-x-2">
                <button
                  onClick={() => editRule(r)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteRule(r.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bg-white p-4 rounded shadow max-w-md">
        <h2 className="font-semibold mb-3">
          {editing ? "✏️ Qoida tahrirlash" : "➕ Yangi qoida"}
        </h2>

        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            type="number"
            placeholder="Minimal to‘lov (UZS)"
            value={data.min_total_deposit}
            onChange={(e) =>
              setData("min_total_deposit", e.target.value)
            }
          />

          <input
            className="input"
            type="number"
            placeholder="Spin soni"
            value={data.spins_count}
            onChange={(e) =>
              setData("spins_count", e.target.value)
            }
          />

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

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Saqlash
          </button>
        </form>
      </div>
    </div>
  );
}
SpinRules.layout = page => <AdminLayout>{page}</AdminLayout>
