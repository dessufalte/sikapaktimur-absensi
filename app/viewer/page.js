"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import {
  handleExportCSV,
  handlePrintBulanan,
  handleSetAbsensi,
  handleDisablePembukuan,
  handleTutupAbsen,
  handleExportExcel,
} from "./_utils/handleEvents";
import { firestore } from "../lib/firebase";
import StackedAbsensiChart from "./_component/chart";
import AbsensiPieChart from "./_component/piechart";
import KalenderAbsensi from "./_component/cale";
import { set } from "firebase/database";
import CardStatistik from "./_component/cardstatistik";
import { FaCheckCircle, FaSync, FaUserEdit } from "react-icons/fa";

export default function View() {
  const [users, setUsers] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [allAbsensi, setAllAbsensi] = useState([]);
  const [filter, setFilter] = useState("minggu");
  const [pages, setPages] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [disablePembukuan, setDisablePembukuan] = useState(false);
  const [currentPageDate, setCurrentPageDate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
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
        const [userRes, statistikRes, paginationRes, allAbsensiRes] =
          await Promise.all([
            fetch("/api/lihat-user"),
            fetch("/api/statistik"),
            fetch(`/api/lihat-ab-pg?page=${pages}`),
            fetch("/api/lihat-absen"),
          ]);

        const userData = await userRes.json();
        const statistikData = await statistikRes.json();
        const paginationData = await paginationRes.json();
        const allAbsensiData = await allAbsensiRes.json();
        if (userData.success) setUsers(userData.data);
        if (statistikData.success) setStatistik(statistikData.data);
        if (paginationData.success) {
          setAbsensi(paginationData.data[0]?.data || []);
          console.log("Absensi Data:", absensi);
          setCurrentPageDate(paginationData.data[0]?.tanggal || new Date());
          setTotalPages(paginationData.totalPages);
        }
        if (allAbsensiData.success) setAllAbsensi(allAbsensiData.data);
      } catch (error) {
        console.error("Gagal fetch data:", error);
      }
    };

    fetchData();
  }, [pages, refreshKey]);

  useEffect(() => {
    const cek = async () => {
      const result = await handleDisablePembukuan(allAbsensi, users);
      console.log("Disable status:", result);
      setDisablePembukuan(result);
    };

    cek();
  }, [allAbsensi, users]);

  const isUserPresent = (userId) => {
    return absensi.some((item) => String(item.id) === String(userId));
  };

  const tutupAbsen = async () => {
    try {
      const result = await handleTutupAbsen();
      alert(`✅ ${result.message}`);
    } catch (err) {
      alert("❌ Gagal menutup absensi");
    }
  };
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedAbsensi = useMemo(() => {
    const data = [...absensi];

    if (!sortConfig.key) return data;

    return data.sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === "nama") {
        const aUser = users.find((u) => String(u.id) === String(a.id));
        const bUser = users.find((u) => String(u.id) === String(b.id));
        aValue = aUser?.nama || "";
        bValue = bUser?.nama || "";
      } else if (sortConfig.key === "jamMasuk") {
        aValue = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        bValue = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [absensi, users, sortConfig]);

  return (
    <main className="p-5 flex flex-col">
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <CardStatistik
          title="Kehadiran Bulan Ini"
          value={`${statistik.persentaseHadirBulan}%`}
          icon="persentase"
        />
        <CardStatistik
          title="Total Terlambat"
          value={`${statistik.totalTerlambat} kali`}
          icon="terlambat"
        />
        <CardStatistik
          title="Total Pengguna"
          value={`${statistik.totalUser} orang`}
          icon="user"
        />
        <CardStatistik
          title="Hari Kerja"
          value={`${statistik.totalHariKerja} hari`}
          icon="hariKerja"
        />
        <CardStatistik
          title="Potensi Absen"
          value={`${statistik.totalPotensiAbsen} catatan`}
          icon="potensi"
        />
        <CardStatistik
          title="Total Hadir"
          value={`${statistik.totalHadir} kali`}
          icon="hadir"
        />

        {/* Filter tetap seperti sebelumnya */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 justify-between">
          <div className="flex flex-col">
            <h2 className="text-emerald-600 font-bold mb-2">Filter :</h2>
            <div className="gap-2 flex flex-row">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="shadow-md border-[1px] border-gray-300 rounded-lg p-2 outline-0 text-black"
              >
                <option value="minggu">Per Minggu</option>
                <option value="bulan">Per Bulan (12 Bulan)</option>
                <option value="tahun">Per Tahun (10 Tahun)</option>
              </select>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="mt-4 sm:mt-0 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
              >
                <FaSync />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="grid lg:grid-cols-4 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-3 lg:col-span-2 bg-white p-4 text-black  border-[1px] border-gray-200 rounded-lg shadow-lg items-center">
          <StackedAbsensiChart filter={filter} dataFromApi={allAbsensi} />
        </div>
        <div className="md:col-span-2 lg:col-span-1 bg-white p-4 items-center text-black  border-[1px] border-gray-200  rounded-lg shadow-lg">
          <AbsensiPieChart filter={filter} dataFromApi={allAbsensi} />
        </div>
        <div className="md:col-span-1 lg:col-span-1 bg-white p-4 text-black  border-[1px] border-gray-200  rounded-lg shadow-lg">
          <KalenderAbsensi />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <div className="lg:col-span-2 md:col-span-2 sm:col-span-1 shadow-lg rounded-2xl border-[1px] border-gray-200 p-4">
          <h2 className="text-emerald-600 font-bold mb-2">Data Pengguna</h2>
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead className="bg-emerald-400">
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
                  <td className="border-b px-2 py-1">{user.id}</td>
                  <td className="border-b px-2 py-1">{user.nama}</td>
                  <td className="border-b px-2 py-1">{user.jabatan}</td>
                  <td className="border-b px-2 py-1 text-center">
                    {!isUserPresent(user.id) && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="text-emerald-500 hover:text-emerald-700 text-xl"
                        title="Set Kehadiran"
                      >
                        <FaUserEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-3 md:col-span-2 sm:col-span-1 flex flex-col shadow-lg rounded-2xl border-[1px] border-gray-200 p-4">
          <h2 className="text-emerald-600 font-bold mb-2">
            Halaman Absensi: {currentPageDate}
          </h2>
          <table className="min-w-full text-sm border-separate border-spacing-0 mb-4">
            <thead className="bg-emerald-400">
              <tr>
                <th
                  className="px-2 py-1 cursor-pointer select-none"
                  onClick={() => handleSort("id")}
                >
                  ID{" "}
                  {sortConfig.key === "id"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th
                  className="px-2 py-1 cursor-pointer select-none"
                  onClick={() => handleSort("nama")}
                >
                  Nama{" "}
                  {sortConfig.key === "nama"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th
                  className="px-2 py-1 cursor-pointer select-none"
                  onClick={() => handleSort("status")}
                >
                  Status{" "}
                  {sortConfig.key === "status"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="px-2 py-1">Keterlambatan</th>
                <th
                  className="px-2 py-1 cursor-pointer select-none"
                  onClick={() => handleSort("jamMasuk")}
                >
                  Jam Masuk{" "}
                  {sortConfig.key === "jamMasuk"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="px-2 py-1">Jam Pulang</th>
              </tr>
            </thead>

            <tbody className="bg-white text-black text-center">
              {sortedAbsensi.map((item) => {
                const user = users.find(
                  (u) => String(u.id) === String(item.id)
                );
                const jam = item.timestamp ? new Date(item.timestamp) : null;

                const jamMasuk =
                  jam?.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) ?? "-";

                const jamPulang =
                  item.timehome && item.timehome.toDate
                    ? item.timehome.toDate().toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : item.timehome
                    ? new Date(item.timehome).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-";

                const lateText = (() => {
                  if (!jam) return "-";
                  const std = new Date(jam);
                  std.setHours(8, 0, 0, 0);
                  const selisih = jam.getTime() - std.getTime();
                  return selisih <= 0
                    ? "Tepat Waktu"
                    : `${Math.floor(selisih / 60000)} menit terlambat`;
                })();

                return (
                  <tr key={item.idDoc}>
                    <td className="border-b px-2 py-1">{item.id}</td>
                    <td className="border-b px-2 py-1">{user?.nama ?? "-"}</td>
                    <td
                      className={`border-b border-black px-2 py-1 font-semibold ${
                        item.status.toLowerCase() === "alfa"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {item.status}
                    </td>
                    <td
                      className={`border-b border-black px-2 py-1 ${
                        ["Alfa", "Izin", "Sakit"].includes(item.status)
                          ? ""
                          : lateText === "Tepat Waktu"
                          ? "text-green-600"
                          : parseInt(lateText) < 30
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {["Alfa", "Izin", "Sakit"].includes(item.status)
                        ? "-"
                        : lateText}
                    </td>
                    <td className="border-b px-2 py-1">{jamMasuk}</td>
                    <td className="border-b px-2 py-1">{jamPulang}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

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
          disabled={disablePembukuan}
          onClick={tutupAbsen}
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
          <>
            <button
              onClick={() => handleExportExcel(selectedMonth)}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
            >
              Export Excel
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
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const status = form.status.value;

                console.log("Form status:", status);
                console.log("Selected user:", selectedUser);
                console.log("Current page date:", currentPageDate);

                const sukses = await handleSetAbsensi({
                  userId: selectedUser.id,
                  status,
                  tanggal: currentPageDate,
                });

                if (sukses) {
                  setShowModal(false);
                  setSelectedUser(null);
                  setRefreshKey((prev) => prev + 1);
                }
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
