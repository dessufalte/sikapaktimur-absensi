import { firestoreAdmin } from "@/app/lib/firebaseadmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tanggal = searchParams.get("tanggal"); // Misalnya "2025-06-27"
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 1;

    // Ambil semua dokumen absensi
    const snapshot = await firestoreAdmin.collection("absensi").get();

    // Siapkan data absensi
    const data = snapshot.docs.map((doc) => {
      const docData = doc.data();
      const timestampDate = docData.timestamp?.toDate?.();
      return {
        idDoc: doc.id,
        ...docData,
        timestamp: timestampDate ? timestampDate.toISOString() : null,
      };
    });

    // Group berdasarkan tanggal
    const groupedByDate = {};
    data.forEach((item) => {
      if (!item.timestamp) return;
      const dateStr = item.timestamp.split("T")[0]; // YYYY-MM-DD
      if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
      groupedByDate[dateStr].push(item);
    });

    // Jika `tanggal` disediakan → ambil data tanggal itu
    if (tanggal) {
      return Response.json({
        success: true,
        tanggal,
        data: groupedByDate[tanggal] || [],
      });
    }

    // Kalau tidak, gunakan pagination (default)
    const sortedDates = Object.keys(groupedByDate).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    const start = (page - 1) * pageSize;
    const pagedDates = sortedDates.slice(start, start + pageSize);

    const pagedData = pagedDates.map((date) => ({
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
