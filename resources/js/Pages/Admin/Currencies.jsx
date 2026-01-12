import { useForm, usePage } from "@inertiajs/react";

export default function Currencies() {
  const { currencies, flash } = usePage().props;

  const { data, setData, post, processing, reset } = useForm({
    code: "",
    name: "",
    symbol: "",
    is_base: false,
  });
  const rateForm = useForm({
    currency_code: "",
    rate_to_base: "",
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("currencies.store"), {
      onSuccess: () => reset(),
    });
  };
  const submitRate = (e) => {
    e.preventDefault();

    rateForm.post(route("currencies.rate.store"), {
      onSuccess: () => rateForm.reset(),
    });
  };


  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">💱 Valyutalar</h1>

      {flash?.success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {flash.success}
        </div>
      )}

      {/* LIST */}
      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th>Code</th>
            <th>Nomi</th>
            <th>Symbol</th>
            <th>Base</th>
            <th>Aktiv</th>
            <th>Oxirgi kurs (UZS)</th>
          </tr>
        </thead>
        <tbody>
          {currencies.map((c) => (
            <tr key={c.code} className="border-t">
              <td className="font-bold">{c.code}</td>
              <td>{c.name}</td>
              <td>{c.symbol}</td>
              <td>{c.is_base ? "✅" : "—"}</td>
              <td>{c.is_active ? "Aktiv" : "Noaktiv"}</td>
              <td>{c.is_base ? "Base" : c.rates[0]?.rate_to_base ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD FORM */}
      <div className="bg-white p-4 rounded shadow max-w-md">
        <h2 className="font-semibold mb-3">➕ Valyuta qo‘shish</h2>

        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="Code (USD, EUR)"
            value={data.code}
            onChange={(e) => setData("code", e.target.value.toUpperCase())}
          />

          <input
            className="input"
            placeholder="Nomi"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
          />

          <input
            className="input"
            placeholder="Symbol"
            value={data.symbol}
            onChange={(e) => setData("symbol", e.target.value)}
          />

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={data.is_base}
              onChange={(e) => setData("is_base", e.target.checked)}
            />
            Base valyuta
          </label>

          <button
            disabled={processing}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Saqlash
          </button>
        </form>
        <div className="bg-white p-4 rounded shadow max-w-md">
          <h2 className="font-semibold mb-3">💱 Kurs qo‘shish / yangilash</h2>

          <form onSubmit={submitRate} className="space-y-3">
            <select
              className="input"
              value={rateForm.data.currency_code}
              onChange={(e) =>
                rateForm.setData("currency_code", e.target.value)
              }
            >
              <option value="">Valyutani tanlang</option>

              {currencies
                .filter((c) => !c.is_base && c.is_active)
                .map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
            </select>

            <input
              className="input"
              type="number"
              step="0.0001"
              placeholder="1 USD = ? UZS"
              value={rateForm.data.rate_to_base}
              onChange={(e) =>
                rateForm.setData("rate_to_base", e.target.value)
              }
            />

            <button
              disabled={rateForm.processing}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Saqlash
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
