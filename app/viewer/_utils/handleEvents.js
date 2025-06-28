import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export async function handleExportCSV(selectedMonth) {
  if (!selectedMonth) return;

  const res = await fetch(`/api/laporan?bulan=${selectedMonth}`);
  const { absensi } = await res.json();

  const rows = [
    ["Nama", "Tanggal", "Status", "Keterlambatan", "Jam Masuk"],
    ...absensi.map((item) => {
      const t = new Date(item.timestamp);
      const tanggal = t.toLocaleDateString("id-ID");
      const jamMasuk = t.toLocaleTimeString("id-ID");

      const keterlambatan = (() => {
        const standar = new Date(t);
        standar.setHours(8, 0, 0, 0);
        const selisih = t.getTime() - standar.getTime();
        return selisih <= 0
          ? "Tepat Waktu"
          : `${Math.floor(selisih / (1000 * 60))} menit terlambat`;
      })();

      return [item.nama, tanggal, item.status, keterlambatan, jamMasuk];
    }),
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `laporan_absensi_${selectedMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function handlePrintBulanan(selectedMonth) {
  if (!selectedMonth) return;

  const res = await fetch(`/api/laporan?bulan=${selectedMonth}`);
  const { absensi } = await res.json();

  const html = `
    <html>
    <head>
      <title>Laporan Absensi Bulan ${selectedMonth}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          padding: 40px;
          color: #000;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
        }

        .header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
        }

        .header h2 {
          margin: 0;
          font-size: 18px;
          margin-bottom: 10px;
        }

        h3 {
          text-align: center;
          margin-top: 30px;
          margin-bottom: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }

        th, td {
          border: 1px solid #000;
          padding: 6px 8px;
          text-align: center;
          font-size: 14px;
        }

        th {
          background-color: #f0f0f0;
        }

        .ttd-section {
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
        }

        .ttd-box {
          width: 45%;
          text-align: center;
        }

        .ttd-space {
          height: 80px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KANTOR WALI NAGARI SIKAPAK TIMUR</h1>
        <h2>LAPORAN ABSENSI PEGAWAI</h2>
        <p><strong>Periode Bulan: ${selectedMonth}</strong></p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Keterlambatan</th>
            <th>Jam Masuk</th>
            <th>Jam Pulang</th>
          </tr>
        </thead>
        <tbody>
          ${absensi
            .map((item) => {
              const t = new Date(item.timestamp);
              const tanggal = t.toLocaleDateString("id-ID");
              const jamMasuk = t.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });

              const jamPulang = item.timehome
                ? new Date(item.timehome).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";

              const keterlambatan = (() => {
                const std = new Date(t);
                std.setHours(8, 0, 0, 0);
                const selisih = t - std;
                return selisih <= 0
                  ? "Tepat Waktu"
                  : `${Math.floor(selisih / 60000)} menit terlambat`;
              })();

              return `<tr>
                <td>${item.nama}</td>
                <td>${tanggal}</td>
                <td>${item.status}</td>
                <td>${item.status === "Alfa" ? "-" : keterlambatan}</td>
                <td>${item.status === "Alfa" ? "-" : jamMasuk}</td>
                <td>${item.status === "Alfa" ? "-" : jamPulang}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>

      <div class="ttd-section">
        <div class="ttd-box">
          <p>Sikapak Timur, .......................</p>
          <p><strong>Kepala Wali Nagari</strong></p>
          <div class="ttd-space"></div>
          <p><strong>(_________________________)</strong></p>
        </div>
        <div class="ttd-box">
          <p>Dicetak oleh:</p>
          <p><strong>Petugas Absensi</strong></p>
          <div class="ttd-space"></div>
          <p><strong>(_________________________)</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}


export async function handleSetAbsensi({ userId, status, tanggal }) {
  try {
    const res = await fetch("/api/set-absensi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status, tanggal }),
    });

    const json = await res.json();
    console.log("API result:", json);

    return json.success;
  } catch (err) {
    console.error("Error saat set absensi:", err);
    return false;
  }
}

export async function handleDisablePembukuan(dataAbsensi = null, dataUser = null) {
  const now = dayjs();
  const jam = now.hour();

  try {
    let absensi = dataAbsensi;
    let users = dataUser;

    if (!absensi) {
      const res = await fetch("/api/lihat-absen");
      const json = await res.json();
      if (!json.success) return false;
      absensi = json.data;
    }

    if (!users) {
      const res = await fetch("/api/lihat-user");
      const json = await res.json();
      if (!json.success) return false;
      users = json.data;
    }

    const absensiHariIni = absensi.filter((item) => {
      const ts = item.timestamp;
      if (!ts || !ts._seconds) return false;

      const date = dayjs.unix(ts._seconds);
      return date.isSame(now, "day");
    });

    const userIdSudahAbsen = new Set(absensiHariIni.map((a) => a.id));
    const semuaSudahAbsen = userIdSudahAbsen.size >= users.length;
    console.log("Semua sudah absen:", semuaSudahAbsen);
    console.log("Jumlah user:", users.length);
    console.log("Jumlah absen hari ini:", userIdSudahAbsen.size);
    if (!semuaSudahAbsen && jam < 17) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("Gagal cek pembukuan:", err);
    return false;
  }
}
export async function handleTutupAbsen() {
  const konfirmasi = confirm("Apakah Anda yakin ingin menutup absensi hari ini?");
  if (!konfirmasi) return null;

  try {
    const response = await fetch("/api/pembukuan", {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      const pesanError = data?.error || "Gagal menutup absensi.";
      alert("❌ " + pesanError);
      return null; // Jangan lempar error lagi
    }

    alert("✅ " + (data.message || "Absensi berhasil ditutup."));
    return data;
  } catch (error) {
    console.error("Error saat menutup absensi:", error);
    // Jika error disebabkan karena user menutup prompt sebelumnya, tidak perlu alert lagi
    alert("❌ Terjadi kesalahan koneksi atau server. Silakan coba lagi.");
    return null;
  }
}

export async function handleExportExcel(selectedMonth) {
  if (!selectedMonth) return;

  const res = await fetch(`/api/laporan?bulan=${selectedMonth}`);
  const { absensi } = await res.json();

  // Format data untuk Excel
  const rows = absensi.map((item) => {
    const t = new Date(item.timestamp);
    const tanggal = t.toLocaleDateString("id-ID");
    const jamMasuk = t.toLocaleTimeString("id-ID");

    const keterlambatan = (() => {
      const standar = new Date(t);
      standar.setHours(8, 0, 0, 0);
      const selisih = t.getTime() - standar.getTime();
      return selisih <= 0
        ? "Tepat Waktu"
        : `${Math.floor(selisih / (1000 * 60))} menit terlambat`;
    })();

    return {
      Nama: item.nama,
      Tanggal: tanggal,
      Status: item.status,
      Keterlambatan: keterlambatan,
      "Jam Masuk": jamMasuk,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `laporan_absensi_${selectedMonth}.xlsx`);
}