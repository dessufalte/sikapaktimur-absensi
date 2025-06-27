import { firestoreAdmin } from "@/app/lib/firebaseadmin";
import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, confidence } = body;

    if (typeof id !== "number") {
      return NextResponse.json(
        { error: "ID (number) wajib diisi" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Gunakan waktu server saat ini (UTC)
    const now = new Date();
    const firestoreTimestamp = admin.firestore.Timestamp.fromDate(now);

    // Cek user
    const userSnapshot = await firestoreAdmin
      .collection("user")
      .where("id", "==", id)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Cek apakah sudah absen hari ini
    const awalHari = new Date(now);
    awalHari.setHours(0, 0, 0, 0);

    const akhirHari = new Date(now);
    akhirHari.setHours(23, 59, 59, 999);

    const absenSnapshot = await firestoreAdmin
      .collection("absensi")
      .where("id", "==", id)
      .get();

    const sudahAbsen = absenSnapshot.docs.some((doc) => {
      const waktu = doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp);
      return waktu >= awalHari && waktu <= akhirHari;
    });

    if (sudahAbsen) {
      return NextResponse.json(
        { error: "User sudah absen hari ini" },
        { status: 409, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Hitung keterlambatan berdasarkan jam 08:00 (server UTC)
    const batasMasuk = new Date(now);
    batasMasuk.setHours(8, 0, 0, 0);

    const late = now > batasMasuk;

    // Tetapkan status selalu "Hadir"
    const statusAbsen = "Hadir";

    await firestoreAdmin.collection("absensi").add({
      id,
      status: statusAbsen,
      late,
      timestamp: firestoreTimestamp,
    });

    return NextResponse.json(
      {
        message: "Absensi berhasil",
        id,
        late,
        status: statusAbsen,
        timestamp: firestoreTimestamp,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
      }
    );
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
