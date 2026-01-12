import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function SpinSectors() {
  const { sectors, flash } = usePage().props;
  const [editing, setEditing] = useState(null);

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
  };

  // 💾 Submit (create / update)
  const submit = (e) => {
    e.preventDefault();

    if (editing) {
      put(route("spin-sectors.update", editing), {
        onSuccess: () => {
          reset();
          setEditing(null);
        },
      });
    } else {
      post(route("spin-sectors.store"), {
        onSuccess: () => reset(),
      });
    }
  };

  // 🗑 Delete
  const deleteSector = (id) => {
    if (!confirm("Spin sektorni o‘chirmoqchimisiz?")) return;
    destroy(route("spin-sectors.destroy", id));
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">🎡 Spin Sectors</h1>

      {flash?.success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
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
              <th>Mukofot turi</th>
              <th>Mukofot</th>
              <th>Probability</th>
              <th>Holat</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sectors.length ? (
              sectors.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.id}</td>
                  <td>{s.title}</td>
                  <td>{s.reward_type}</td>
                  <td>
                    {s.reward_type === "none"
                      ? "—"
                      : s.reward_value}
                  </td>
                  <td>{s.probability}</td>
                  <td>
                    {s.is_active ? (
                      <span className="text-green-600">Aktiv</span>
                    ) : (
                      <span className="text-red-500">Noaktiv</span>
                    )}
                  </td>
                  <td className="space-x-2">
                    <button
                      onClick={() => editSector(s)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSector(s.id)}
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
                <td
                  colSpan="7"
                  className="p-4 text-center text-gray-500"
                >
                  Spin sektorlar yo‘q
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded shadow max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? "✏️ Spin sektorni tahrirlash" : "➕ Yangi spin sektor"}
        </h2>

        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="Masalan: 5000 so‘m"
            value={data.title}
            onChange={(e) => setData("title", e.target.value)}
          />
          {errors.title && (
            <div className="text-red-500">{errors.title}</div>
          )}

          <select
            className="input"
            value={data.reward_type}
            onChange={(e) => setData("reward_type", e.target.value)}
          >
            <option value="balance">Balans</option>
            <option value="pubg">PUBG UC</option>
            <option value="none">Bo‘sh</option>
          </select>

          {data.reward_type !== "none" && (
            <input
              className="input"
              type="number"
              placeholder="Mukofot qiymati"
              value={data.reward_value}
              onChange={(e) =>
                setData("reward_value", e.target.value)
              }
            />
          )}

          <input
            className="input"
            type="number"
            placeholder="Probability (og‘irlik)"
            value={data.probability}
            onChange={(e) =>
              setData("probability", e.target.value)
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
