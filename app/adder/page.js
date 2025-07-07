"use client";

import { useEffect, useState } from "react";
// Auth sudah tidak diperlukan di sini, kita hanya butuh database
import { database } from "../lib/firebase";
import { ref, onValue } from "firebase/database";

export default function Adder() {
  const [idFingerprint, setIdFingerprint] = useState("");
  const [form, setForm] = useState({
    nama: "",
    jabatan: "",
  });
  const [status, setStatus] = useState("Menghubungkan ke database sensor...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Karena tidak perlu otentikasi, kita bisa langsung terhubung ke database
    const idRef = ref(database, "tambah_fingerprint");
    
    const unsubscribeFromDb = onValue(idRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || !data.timestamp) {
        setIdFingerprint("");
        setStatus("Menunggu data dari sensor fingerprint...");
        return;
      }

      const now = new Date();
      const fingerprintTime = new Date(data.timestamp);
      const timeDiffMinutes = (now.getTime() - fingerprintTime.getTime()) / 1000 / 60;

      if (timeDiffMinutes <= 5) {
        setIdFingerprint(data.id?.toString() || "");
        setStatus("✅ Sensor terhubung. Silakan isi data.");
      } else {
        setIdFingerprint("");
        setStatus("Menunggu data baru dari sensor fingerprint...");
      }
    }, (error) => {
        console.error("Database read error:", error);
        setStatus(`❌ Gagal membaca data sensor: ${error.code}`);
    });

    // Cleanup function saat komponen di-unmount
    return () => {
      unsubscribeFromDb();
    };
  }, []); // Dependency array kosong, berjalan sekali saat mount

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
    setIsSubmitting(true);
    setStatus("Menyimpan data...");

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
      } else {
        setStatus("✅ Data berhasil ditambahkan!");
        setForm({ nama: "", jabatan: "" });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("❌ Gagal terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... JSX (return statement) tidak perlu diubah, bisa gunakan yang dari sebelumnya
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
            placeholder="Menunggu..."
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
            <option value="Kepala Desa">Kepala Desa</option>
            <option value="Sekretaris Desa">Sekretaris Desa</option>
            <option value="Kepala Seksi">Kepala Seksi</option>
            <option value="Kepala Dusun">Kepala Dusun</option>
            <option value="Kepala Urusan">Kepala Urusan</option>
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !idFingerprint}
            className="w-full py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>

        {status && (
          <div
            className={`text-center text-sm font-medium mt-4 p-3 rounded-md ${
              status.startsWith("✅") ? "bg-emerald-100 text-emerald-800"
              : status.startsWith("❌") ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
            }`}
          >
            {status}
          </div>
        )}
      </form>
    </main>
  );
}
