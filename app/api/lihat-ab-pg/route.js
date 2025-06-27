import { firestoreAdmin } from "@/app/lib/firebaseadmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 1; // Selalu 1 hari per halaman

    // Ambil semua dokumen dari koleksi absensi
    const snapshot = await firestoreAdmin.collection("absensi").get();

    // Konversi dan siapkan data absensi
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      const timestampDate = docData.timestamp?.toDate?.();
      return {
        idDoc: doc.id,
        ...docData,
        timestamp: timestampDate ? timestampDate.toISOString() : null,
      };
    });

    // Group berdasarkan tanggal (string YYYY-MM-DD)
    const groupedByDate = {};
    data.forEach(item => {
      if (!item.timestamp) return;
      const dateStr = item.timestamp.split("T")[0];
      if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
      groupedByDate[dateStr].push(item);
    });

    // Urutkan tanggal dari terbaru ke terlama
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

    // Ambil 1 hari (group) sesuai halaman
    const start = (page - 1) * pageSize;
    const pagedDates = sortedDates.slice(start, start + pageSize);

    const pagedData = pagedDates.map(date => ({
      tanggal: date,
      data: groupedByDate[date],
    }));

    return Response.json({
      success: true,
      page,
      totalPages: Math.ceil(sortedDates.length / pageSize),
      data: pagedData,
    });

  } catch (error) {
    console.error("Pagination error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
