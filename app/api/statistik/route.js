// app/api/statistik/route.js
import { firestoreAdmin } from "@/app/lib/firebaseadmin";

export async function GET() {
  try {
    const usersSnap = await firestoreAdmin.collection("user").get();
    const absensiSnap = await firestoreAdmin.collection("absensi").get();

    const users = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const absensi = absensiSnap.docs.map((doc) => ({
      idDoc: doc.id,
      ...doc.data(),
    }));

    const now = new Date();
    const bulanIni = now.getMonth();
    const tahunIni = now.getFullYear();

    const absensiBulanIni = absensi.filter((item) => {
      const t = item.timestamp?.toDate?.() || new Date(item.timestamp);
      return t && t.getMonth() === bulanIni && t.getFullYear() === tahunIni;
    });

    const totalUser = users.length;
    const totalHariKerja = new Set(
      absensiBulanIni.map((item) => {
        const t = item.timestamp?.toDate?.() || new Date(item.timestamp);
        return t.toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
      })
    ).size;

    const totalPotensiAbsen = totalUser * totalHariKerja;

    const totalHadir = absensiBulanIni.filter(
      (item) => item.status === "Hadir"
    ).length;

    const totalTerlambat = absensiBulanIni.filter(
      (item) => item.late && item.status === "Hadir"
    ).length;

    const persentaseHadirBulan = totalPotensiAbsen
      ? Math.round((totalHadir / totalPotensiAbsen) * 100)
      : 0;

    return Response.json({
      success: true,
      data: {
        totalUser,
        totalHariKerja,
        totalPotensiAbsen,
        totalHadir,
        totalTerlambat,
        persentaseHadirBulan,
      },
    });
  } catch (error) {
    console.error("Statistik API error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
