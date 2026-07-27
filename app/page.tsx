"use client";

import { useState } from "react";

export default function Home() {
  const [tab, setTab] = useState("dashboard");
  const [gastos, setGastos] = useState([]);
  const [form, setForm] = useState({ concepto: "", monto: "", moneda: "ARS" });

  const agregarGasto = () => {
    if (!form.concepto || !form.monto) return alert("Completa concepto y monto");

    const nuevo = {
      id: Date.now(),
      ...form,
      monto: parseFloat(form.monto),
    };

    setGastos([...gastos, nuevo]);
    setForm({ concepto: "", monto: "", moneda: "ARS" });
    alert("✅ Gasto agregado");
  };

  const mesActual = new Date().toISOString().substring(0, 7);
  const gastosDelMes = gastos.filter(g => new Date(g.id).toISOString().substring(0, 7) === mesActual);
  const gastoArsEsteMes = gastosDelMes.filter(g => g.moneda === "ARS").reduce((s, g) => s + g.monto, 0);
  const gastoUsdEsteMes = gastosDelMes.filter(g => g.moneda === "USD").reduce((s, g) => s + g.monto, 0);

  const ars = 1100000;
  const usd = 600;
  const arsDisponible = ars - gastoArsEsteMes - 800;
  const usdDisponible = usd - gastoUsdEsteMes - 200;

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="bg-indigo-600 text-white p-6 text-center">
        <h1 className="text-4xl font-bold">💰 Gastos</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab("dashboard")} className={`px-4 py-2 rounded font-bold ${tab === "dashboard" ? "bg-indigo-600 text-white" : "bg-white border-2 border-indigo-600"}`}>
            Dashboard
          </button>
          <button onClick={() => setTab("agregar")} className={`px-4 py-2 rounded font-bold ${tab === "agregar" ? "bg-indigo-600 text-white" : "bg-white border-2 border-indigo-600"}`}>
            Agregar
          </button>
        </div>

        {tab === "dashboard" && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">🇦🇷 ARS</h2>
              <p>Total: ${ars.toLocaleString()}</p>
              <p className="text-xl font-bold my-2">Disponible: ${arsDisponible.toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">💵 USD</h2>
              <p>Total: ${usd}</p>
              <p className="text-xl font-bold my-2">Disponible: ${usdDisponible}</p>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-bold mb-3">Gastos este mes: {gastos.length}</h3>
              {gastos.length === 0 ? (
                <p>Sin gastos</p>
              ) : (
                <ul className="space-y-2">
                  {gastos.map(g => (
                    <li key={g.id}>{g.concepto}: ${g.monto} {g.moneda}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === "agregar" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Nuevo Gasto</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Concepto (ej: Comida)"
                value={form.concepto}
                onChange={(e) => setForm({...form, concepto: e.target.value})}
                className="w-full p-3 border-2 border-gray-300 rounded"
              />

              <input
                type="number"
                placeholder="Monto (ej: 500)"
                value={form.monto}
                onChange={(e) => setForm({...form, monto: e.target.value})}
                className="w-full p-3 border-2 border-gray-300 rounded"
              />

              <select
                value={form.moneda}
                onChange={(e) => setForm({...form, moneda: e.target.value})}
                className="w-full p-3 border-2 border-gray-300 rounded"
              >
                <option>ARS</option>
                <option>USD</option>
              </select>

              <button
                onClick={agregarGasto}
                className="w-full bg-green-600 text-white p-3 rounded font-bold text-lg hover:bg-green-700"
              >
                ✅ GUARDAR GASTO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
