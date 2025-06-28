import { CheckCircle, Clock, Download, FileText } from "lucide-react"; // opsional icon
import { Fingerprint, BookCheck, Printer } from "lucide-react";

export default function DokumentasiCard() {
  return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      <h2 className="text-emerald-600 text-3xl font-bold text-center mb-8">
        Dokumentasi Penggunaan
      </h2>

      {/* Fitur-fitur Aplikasi */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📌 Fitur-Fitur Aplikasi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Fingerprint className="w-8 h-8 text-emerald-500" />, title: "Absensi Sidik Jari", desc: "Mencatat kehadiran berdasarkan fingerprint sensor secara real-time." },
            { icon: <Clock className="w-8 h-8 text-emerald-500" />, title: "Deteksi Keterlambatan", desc: "Sistem otomatis mencatat siapa yang datang terlambat berdasarkan waktu server." },
            { icon: <BookCheck className="w-8 h-8 text-emerald-500" />, title: "Pembukuan", desc: "Menandai pegawai yang tidak hadir sebagai Alfa jika belum absen hingga akhir hari." },
            { icon: <FileText className="w-8 h-8 text-emerald-500" />, title: "Rekap Laporan", desc: "Melihat riwayat kehadiran berdasarkan tanggal dan bulan." },
            { icon: <Printer className="w-8 h-8 text-emerald-500" />, title: "Cetak & Arsip", desc: "Mencetak laporan bulanan untuk keperluan dokumentasi fisik." },
            { icon: <Download className="w-8 h-8 text-emerald-500" />, title: "Export Excel", desc: "Ekspor data absensi ke format CSV atau Excel." },
          ].map((f, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-md flex gap-4 items-start">
              {f.icon}
              <div>
                <h4 className="font-semibold text-gray-800">{f.title}</h4>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Langkah Penggunaan */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🧭 Langkah Penggunaan</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 text-sm sm:text-base">
          <li>Pastikan perangkat fingerprint telah terkoneksi dan aktif.</li>
          <li>Setiap pegawai meletakkan jari di sensor untuk melakukan absen masuk.</li>
          <li>Data waktu akan tercatat otomatis ke dalam sistem dan database.</li>
          <li>Untuk absen pulang, ulangi proses di atas setelah pukul 16.00 WIB.</li>
          <li>Data kehadiran dapat dicek melalui dashboard aplikasi web.</li>
          <li>Laporan dapat dicetak atau diekspor melalui fitur yang tersedia.</li>
        </ol>
      </div>
    </section>
  );
}
