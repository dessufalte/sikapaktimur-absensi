// pages/about.jsx atau bisa juga di komponen biasa
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-emerald-600 mb-4">
          About
        </h1>

        <p className="mb-4 text-justify">
          Aplikasi ini dikembangkan untuk mempermudah pencatatan dan pemantauan
          kehadiran pegawai di lingkungan
          <strong> Kantor Wali Nagari Sikapak Timur</strong>. Dengan sistem
          digital ini, proses absen masuk dan pulang menjadi lebih efisien,
          transparan, dan dapat dipantau secara real-time.
        </p>

        <p className="mb-4 text-justify">
          Fitur yang tersedia mencakup pencatatan kehadiran, deteksi
          keterlambatan, laporan bulanan, dan sistem pembukuan otomatis bagi
          pegawai yang tidak hadir. Data dapat diekspor ke format Excel atau
          dicetak sebagai dokumen resmi.
        </p>

        <h2 className="text-xl font-semibold text-emerald-500 mt-6 mb-2">
          Contact Person
        </h2>
        <ul className="list-none text-sm text-gray-700 space-y-1">
          <li>
            <span className="font-semibold">Yoan Purbolinggo - </span>
            <a
              href="mailto:imam@example.com"
              className="text-emerald-600 hover:underline"
            >
              @gmail.com
            </a>
          </li>
          <li>
            <span className="font-semibold">Imam - </span>
            <a
              href="mailto:imam@example.com"
              className="text-emerald-600 hover:underline"
            >
              @gmail.com
            </a>
          </li>
          <li>
            <span className="font-semibold">Rafki - </span>
            <a
              href="mailto:rizky@example.com"
              className="text-emerald-600 hover:underline"
            >
              @example.com
            </a>
          </li>
        </ul>

        <div className="mt-10 text-sm text-gray-500 text-right">
          © {new Date().getFullYear()} Wali Nagari Sikapak Timur
        </div>
      </div>
    </div>
  );
}
