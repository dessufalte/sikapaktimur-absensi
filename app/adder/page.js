"use client";

import { useEffect, useState } from "react";
// Import 'getAuth' and 'signInAnonymously' from the Firebase Auth SDK
import { getAuth, signInAnonymously } from "firebase/auth";
import { database } from "../lib/firebase"; // Your existing firebase initialization
import { ref, onValue } from "firebase/database";

export default function Adder() {
  const [idFingerprint, setIdFingerprint] = useState("");
  const [form, setForm] = useState({
    nama: "",
    jabatan: "",
  });
  const [status, setStatus] = useState("Menghubungkan ke database..."); // Initial status

  useEffect(() => {
    // This function will be called to clean up the listener when the component unmounts
    let unsubscribeFromDb = () => {};

    // 1. Get the Firebase Auth instance
    const auth = getAuth();

    // 2. Sign in the user anonymously
    signInAnonymously(auth)
      .then(() => {
        // 3. Once signed in, set up the Realtime Database listener
        console.log("User signed in anonymously.");
        setStatus(""); // Clear connecting status

        const idRef = ref(database, "tambah_fingerprint");
        unsubscribeFromDb = onValue(idRef, (snapshot) => {
          const data = snapshot.val();
          if (!data || !data.timestamp) {
            setIdFingerprint("");
            return;
          }

          const now = new Date();
          const fingerprintTime = new Date(data.timestamp);
          const timeDiffMinutes = (now.getTime() - fingerprintTime.getTime()) / 1000 / 60;

          if (timeDiffMinutes <= 5) {
            setIdFingerprint(data.id?.toString() || "");
          } else {
            setIdFingerprint("");
          }
        }, (error) => {
            // Handle potential errors from the database listener itself
            console.error("Database read error:", error);
            setStatus("❌ Gagal membaca data dari sensor.");
        });
      })
      .catch((error) => {
        // Handle errors during anonymous sign-in
        console.error("Anonymous sign-in failed:", error);
        setStatus("❌ Gagal melakukan otentikasi ke database.");
      });

    // 4. Return the cleanup function
    // This will be executed when the component is unmounted to prevent memory leaks
    return () => {
      unsubscribeFromDb();
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount

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
            placeholder={!idFingerprint ? "Menunggu data dari sensor..." : ""}
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
