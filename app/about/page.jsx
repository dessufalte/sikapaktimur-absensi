export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-800">
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
        
        {/* Logo Bar */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <img
            src="/images/unand.svg"
            alt="Universitas Andalas"
            className="h-16 transition-transform hover:scale-110"
          />
          <img
            src="/images/laboratorium1.png"
            alt="Laboratorium ResLab"
            className="h-16 transition-transform hover:scale-110"
          />
          <img
            src="/images/laboratorium2.png"
            alt="Laboratorium Komputer Jaringan"
            className="h-16 transition-transform hover:scale-110"
          />
          <img
            src="/images/tekom.png"
            alt="Teknik Komputer"
            className="h-16 transition-transform hover:scale-110"
          />
        </div>

        {/* Judul */}
        <h1 className="text-4xl font-extrabold text-emerald-600 text-center mb-6">
          Tentang Aplikasi
        </h1>

        {/* Konten Deskripsi */}
        <div className="grid md:grid-cols-2 gap-6 text-justify text-lg leading-relaxed">
          <p>
            Aplikasi ini dikembangkan untuk mempermudah pencatatan dan
            pemantauan kehadiran pegawai di lingkungan
            <strong> Kantor Desa Sikapak Timur</strong>. Dengan sistem
            digital ini, proses absen masuk dan pulang menjadi lebih efisien,
            transparan, dan dapat dipantau secara real-time.
          </p>

          <p>
            Fitur utama mencakup pencatatan kehadiran otomatis, deteksi
            keterlambatan, laporan bulanan yang akurat, serta sistem pembukuan
            bagi pegawai yang tidak hadir. Data absensi juga dapat diekspor
            ke dalam format Excel atau dicetak untuk keperluan dokumentasi resmi.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-gray-500 text-right border-t pt-4">
          © {new Date().getFullYear()} Desa Sikapak Timur – Teknik Komputer Universitas Andalas
        </div>
      </div>
    </div>
  );
}
