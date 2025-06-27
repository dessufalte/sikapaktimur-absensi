"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { handleExportCSV, handlePrintBulanan } from "./_utils/handleEvents";
import { firestore } from "../lib/firebase";
import StackedAbsensiChart from "./_component/chart";
import AbsensiPieChart from "./_component/piechart";
import KalenderAbsensi from "./_component/cale";

export default function View() {
  const [users, setUsers] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [filter, setFilter] = useState("minggu");
  const [pages, setPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [disablePembukuan, setDisablePembukuan] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [statistik, setStatistik] = useState({
    totalUser: 0,
    totalHariKerja: 0,
    totalPotensiAbsen: 0,
    totalHadir: 0,
    totalTerlambat: 0,
    persentaseHadirBulan: 0,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, absenRes] = await Promise.all([
          fetch("/api/get-users"),
          fetch("/api/get-absensi"),
        ]);

        const userData = await userRes.json();
        const absenData = await absenRes.json();

        if (userData.success) setUsers(userData.data);
        if (absenData.success) setAbsensi(absenData.data);
      } catch (error) {
        console.error("Gagal fetch data:", error);
      }
    };

    fetchData();
  }, []);
  const formatDate = (timestamp) => {
    return timestamp?.toDate
      ? timestamp.toDate().toISOString().split("T")[0]
      : "Tidak tersedia";
  };

  const groupedByDate = useMemo(() => {
    const grouped = {};
    absensi.forEach((item) => {
      const date = formatDate(item.timestamp);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  }, [absensi]);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalisasi tanggal hari ini ke pukul 00:00:00

  const absensiHariIni = absensi.filter((item) => {
    const t = item.timestamp?.toDate?.(); // Jika Firestore Timestamp
    if (!t) return false;

    const tanggalAbsensi = new Date(t);
    tanggalAbsensi.setHours(0, 0, 0, 0); // Normalisasi waktu absensi ke 00:00:00

    return tanggalAbsensi.getTime() === today.getTime(); // Bandingkan tanggal
  });

  console.log("Absensi hari ini:", absensiHariIni);
  const sortedDates = useMemo(() => {
    return Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
  }, [groupedByDate]);
  const isUserPresent = (userId) => {
    return currentData.some((item) => String(item.id) === String(userId));
  };
  const handlePembukuan = async () => {
    const usersBelumAbsen = users.filter(
      (user) =>
        !absensiHariIni.some((absen) => String(absen.id) === String(user.id))
    );

    console.log("Users belum absen:", currentData, usersBelumAbsen);
    const absensiRef = collection(firestore, "absensi");
    const { addDoc, Timestamp } = await import("firebase/firestore");

    const batchPromises = usersBelumAbsen.map((user) => {
      return addDoc(absensiRef, {
        id: user.id,
        status: "Alfa",
        late: false,
        timestamp: Timestamp.fromDate(new Date()),
      });
    });

    await Promise.all(batchPromises);
    alert(
      "Pembukuan selesai. User yang tidak hadir otomatis dicatat sebagai Alpha."
    );
  };
  useEffect(() => {
    if (users.length === 0 || absensi.length === 0) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const absensiHariIni = absensi.filter((item) => {
      const t = item.timestamp?.toDate?.() || new Date(item.timestamp);
      const dateStr = t.toISOString().split("T")[0];
      return dateStr === todayStr;
    });

    const userIdsHariIni = absensiHariIni.map((a) => String(a.id));
    const semuaSudahAbsen = users.every((user) =>
      userIdsHariIni.includes(String(user.id))
    );

    // Jika semua sudah absen ATAU waktu sekarang sudah lewat jam 17.00
    const isAfter1700 = now.getHours() >= 17;

    setDisablePembukuan(!(semuaSudahAbsen || isAfter1700));
  }, [absensi, users]);

  const totalPages = sortedDates.length;
  const currentPageDate = sortedDates[pages - 1];
  const currentData = groupedByDate[currentPageDate] || [];
  const now = new Date();
  const bulanIni = now.getMonth();
  const tahunIni = now.getFullYear();

  const absensiBulanIni = absensi.filter((item) => {
    const t = item.timestamp?.toDate?.();
    return t && t.getMonth() === bulanIni && t.getFullYear() === tahunIni;
  });

  const totalUser = users.length;
  const totalHariKerja = new Set(
    absensiBulanIni.map(
      (item) => item.timestamp?.toDate?.()?.toISOString().split("T")[0]
    )
  ).size;

  const totalPotensiAbsen = totalUser * totalHariKerja;

  const totalHadir = absensiBulanIni.filter(
    (item) => item.status == "Hadir"
  ).length;

  const totalTerlambat = absensiBulanIni.filter(
    (item) => item.late && item.status === "Hadir"
  ).length;

  const persentaseHadirBulan = totalPotensiAbsen
    ? Math.round((totalHadir / totalPotensiAbsen) * 100)
    : 0;

  return (
    <main className="p-5 flex flex-col">
      <section className="grid grid-cols-3-row grid-cols-4 gap-4 mb-6">
        <div className="card border-l-4 bg-white-500 border-t-[1px] border-t-gray-200 border-r-[1px] border-r-gray-200 text-emerald-500 p-4 shadow-lg rounded-lg">
          <h1 className="font-bold text-md">
            {totalHadir}/{totalPotensiAbsen} Hadir Bulan Ini
          </h1>
          <p className="text-emerald-400">{persentaseHadirBulan}% Kehadiran</p>
        </div>

        {/* Terlambat Bulan Ini */}
        <div className="card bg-white-500 border-t-[1px] border-t-gray-200 border-r-[1px] border-r-gray-200 border-l-4 text-emerald-500 p-4 shadow-lg rounded-lg">
          <h1 className="font-bold text-md">{totalTerlambat} Terlambat</h1>
          <p className="text-emerald-400">Periode: Bulan Ini</p>
        </div>
        {(() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const absensiHariIni = absensi.filter((item) => {
            const t = item.timestamp?.toDate?.();
            if (!t) return false;
            t.setHours(0, 0, 0, 0);
            return t.getTime() === today.getTime();
          });

          const totalUser = users.length;
          const hadir = absensiHariIni.filter(
            (item) => item.status == "Hadir"
          ).length;

          const persentase = totalUser
            ? Math.round((hadir / totalUser) * 100)
            : 0;

          return (
            <div className="card border-l-4 bg-white-500 text-emerald-500 border-t-[1px] border-t-gray-200 border-r-[1px] border-r-gray-200 p-4 shadow-lg rounded-lg">
              <h1 className="font-bold text-md">
                {hadir}/{totalUser} Kehadiran Hari ini
              </h1>
              <p className="text-emerald-400">{persentase}% Hadir</p>
            </div>
          );
        })()}
        <div className="grid grid-rows-2">
          <h2 className="text-emerald-600 font-bold mb-2">Filter :</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="shadow-lg border-[1px] border-gray-200 rounded-lg p-2 outline-0 text-black"
          >
            <option value="minggu">Per Minggu</option>
            <option value="bulan">Per Bulan (12 Bulan)</option>
            <option value="tahun">Per Tahun (10 Tahun)</option>
          </select>
        </div>
      </section>

      <section className="grid lg:grid-cols-4 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-3 lg:col-span-2 bg-white p-4 text-black  border-[1px] border-gray-200 rounded-lg shadow-lg items-center">
          <StackedAbsensiChart filter={filter} />
        </div>
        <div className="md:col-span-2 lg:col-span-1 bg-white p-4 items-center text-black  border-[1px] border-gray-200  rounded-lg shadow-lg">
          <AbsensiPieChart filter={filter} />
        </div>
        <div className="md:col-span-1 lg:col-span-1 bg-white p-4 text-black  border-[1px] border-gray-200  rounded-lg shadow-lg">
          <KalenderAbsensi />
        </div>
      </section>

      <section className="grid grid-cols-5 gap-4">
        <div className="col-span-2 shadow-lg rounded-2xl border-[1px] border-gray-200 p-4">
          <h2 className="text-emerald-600 font-bold mb-2">Data Pengguna</h2>
          <table className="min-w-full text-emerald-white text-sm border-separate  border-spacing-0">
            <thead className=" bg-emerald-400">
              <tr>
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Nama</th>
                <th className="px-2 py-1">Jabatan</th>
                <th className="px-2 py-1">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white text-center text-black">
              {users.map((user) => (
                <tr key={user.idDoc}>
                  <td className="border-b-1 border-emerald-200 px-2 py-1">
                    {user.id}
                  </td>
                  <td className="border-b-1 border-emerald-200 px-2 py-1">
                    {user.nama}
                  </td>
                  <td className="border-b-1 border-emerald-200 px-2 py-1">
                    {user.jabatan}
                  </td>
                  <td className="border-b-1 border-emerald-200 px-2 py-1">
                    {!isUserPresent(user.id) && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded"
                      >
                        Set Kehadiran
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-3 flex flex-col shadow-lg rounded-2xl border-[1px] border-gray-200 p-4 min-w-56">
          <h2 className="text-emerald-600 font-bold mb-2">
            Tanggal: {currentPageDate ?? "Tidak Diketahui"}
          </h2>
          <table className="min-w-full text-emerald-white text-sm border-separate border-spacing-0 mb-4">
            <thead className="bg-emerald-400">
              <tr>
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Nama</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Keterlambatan</th>
                <th className="border border-emerald-400 px-2 py-1">
                  Jam Masuk
                </th>
              </tr>
            </thead>
            <tbody className="bg-white text-black">
              {currentData.map((item) => {
                const user = users.find(
                  (u) => String(u.id) === String(item.id)
                );
                const jamMasuk = item.timestamp?.toDate
                  ? item.timestamp.toDate().toLocaleString("id-ID")
                  : "Tidak tersedia";

                return (
                  <tr className="text-center" key={item.idDoc}>
                    <td className="border-b-1 border-emerald-200 px-2 py-1">
                      {item.id}
                    </td>
                    <td className="border-b-1 border-emerald-200 px-2 py-1">
                      {user?.nama ?? "Tidak Diketahui"}
                    </td>
                    <td className="border-b-1 border-emerald-200 px-2 py-1">
                      {item.status ?? "Tidak Diketahui"}
                    </td>
                    <td className="border-b-1 border-emerald-200 px-2 py-1">
                      {(() => {
                        const jamMasuk = item.timestamp?.toDate?.();
                        if (!jamMasuk) return "Tidak tersedia";

                        const jamStandar = new Date(jamMasuk);
                        jamStandar.setHours(8, 0, 0, 0); // jam 08:00:00

                        const selisih =
                          jamMasuk.getTime() - jamStandar.getTime();

                        if (selisih <= 0) {
                          return "Tepat Waktu";
                        } else {
                          const menitTerlambat = Math.floor(
                            selisih / (1000 * 60)
                          );
                          return `${menitTerlambat} menit terlambat`;
                        }
                      })()}
                    </td>

                    <td className="border-b border-emerald-200 px-2 py-1">
                      {jamMasuk}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between mt-auto">
            <button
              onClick={() => setPages((p) => Math.max(1, p - 1))}
              disabled={pages === 1}
              className="bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="text-black self-center">
              Halaman {pages} dari {totalPages}
            </span>
            <button
              onClick={() => setPages((p) => Math.min(totalPages, p + 1))}
              disabled={pages === totalPages}
              className="bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </section>
      <div className="flex flex-row p-4 shadow-lg border-[1px] border-gray-100 rounded-2xl text-sm mt-4 gap-2">
        <button
          onClick={handlePembukuan}
          disabled={disablePembukuan}
          className={`rounded-lg px-4 py-2 text-white ${
            disablePembukuan
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Tutup Absensi Hari Ini (Dibuka 17.00)
        </button>
        {filter === "bulan" && (
          <>
            <button
              onClick={() => handlePrintBulanan(selectedMonth)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded "
            >
              Print
            </button>
          </>
        )}
        {filter === "bulan" && (
          <button
            onClick={() => handleExportCSV(selectedMonth)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
          >
            Export CSV
          </button>
        )}
        {filter === "bulan" && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-3 rounded text-emerald-500"
          />
        )}
      </div>
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black">
            <h2 className="text-xl font-bold mb-4">
              Set Kehadiran: {selectedUser.nama}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const status = form.status.value;
                const late = false;
                const [yr, mt, dy] = currentPageDate.split("-").map(Number);
                const date = new Date(yr, mt - 1, dy);
                date.setHours(8, 0, 0, 0);

                const timestamp = Timestamp.fromDate(date);

                // Simpan ke Firestore
                const absensiRef = collection(firestore, "absensi");
                const newData = {
                  id: selectedUser.id,
                  status,
                  late,
                  timestamp,
                };

                // Tambahkan dokumen
                import("firebase/firestore").then(({ addDoc }) => {
                  addDoc(absensiRef, newData).then(() => {
                    setShowModal(false);
                    setSelectedUser(null);
                  });
                });
              }}
            >
              <label className="block mb-2">
                Status:
                <select name="status" className="w-full border p-1 rounded">
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpha">Alpha</option>
                </select>
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
