"use client";

import { useEffect, useState } from "react";
import { fetchSettings, saveSettings } from "./_utils/eventHandler";

export default function SettingsPage() {
  const [form, setForm] = useState({ wifiName: "", wifiPassword: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchSettings()
      .then(setForm)
      .catch((err) => setStatus("❌ " + err.message));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      await saveSettings(form);
      setStatus("✅ Pengaturan berhasil disimpan.");
    } catch (err) {
      setStatus("❌ " + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <h1 className="text-3xl font-bold text-emerald-600 mb-8">Pengaturan Wi-Fi</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Wi-Fi
          </label>
          <input
            type="text"
            name="wifiName"
            value={form.wifiName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password Wi-Fi
          </label>
          <input
            type="text"
            name="wifiPassword"
            value={form.wifiPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition font-semibold"
        >
          Simpan Pengaturan
        </button>

        {status && <div className="text-sm font-medium mt-3 text-emerald-600">{status}</div>}
      </form>
    </main>
  );
}
