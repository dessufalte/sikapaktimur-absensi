"use client";

import { useEffect, useState } from "react";
import { database } from "../lib/firebase";
import { ref, onValue } from "firebase/database";

export default function Adder() {
  const [idFingerprint, setIdFingerprint] = useState("");
  const [form, setForm] = useState({
    nama: "",
    jabatan: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const idRef = ref(database, "tambah_fingerprint");
    const unsubscribe = onValue(idRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || !data.timestamp) {
        setIdFingerprint("");
        return;
      }

      const now = new Date();
      const fingerprintTime = new Date(data.timestamp);
      const timeDiffMinutes = (now - fingerprintTime) / 1000 / 60;

      if (timeDiffMinutes <= 5) {
        setIdFingerprint(data.id?.toString() || "");
      } else {
        setIdFingerprint("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idFingerprint) {
      setStatus("❌ ID belum tersedia dari sensor fingerprint.");
      return;
    }

    try {
      const res = await fetch("/api/tambah-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parseInt(idFingerprint),
          nama: form.nama,
          jabatan: form.jabatan,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setStatus(`❌ ${result.error || "Gagal menyimpan data."}`);
        return;
      }

      setStatus("✅ Data berhasil ditambahkan!");
      setForm({ nama: "", jabatan: "" });
    } catch (err) {
      console.error("Gagal tambah data:", err);
      setStatus("❌ Gagal menyimpan data.");
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <h1 className="text-3xl font-bold text-emerald-500 mb-8">
        Tambah Data Absensi
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID dari Fingerprint (otomatis)
          </label>
          <input
            type="text"
            value={idFingerprint}
            readOnly
            required
            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama
          </label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jabatan
          </label>
          <select
            name="jabatan"
            value={form.jabatan}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-emerald-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Pilih jabatan</option>
            <option value="Staff">Staff</option>
            <option value="Kepala Dinas">Kepala Desa</option>
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition font-semibold"
          >
            Simpan Data
          </button>
        </div>

        {status && (
          <div
            className={`text-sm font-medium mt-2 ${
              status.startsWith("✅")
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {status}
          </div>
        )}
      </form>
    </main>
  );
}
