import { firestoreAdmin } from "@/app/lib/firebaseadmin";
import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(req) {
  try {
    const { id, confidence } = await req.json();

    if (typeof id !== "number") {
      return NextResponse.json(
        { error: "ID (number) wajib diisi" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // 🔍 Cek apakah user valid
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

    const now = new Date();
    const firestoreTimestamp = admin.firestore.Timestamp.fromDate(now);

    // Konversi ke WIB
    const nowWIB = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const awalHari = new Date(nowWIB);
    awalHari.setHours(0, 0, 0, 0);
    const akhirHari = new Date(nowWIB);
    akhirHari.setHours(23, 59, 59, 999);

    // Cek apakah user sudah absen hari ini
    const absenSnapshot = await firestoreAdmin
      .collection("absensi")
      .where("id", "==", id)
      .get();

    let absenHariIni = null;

    absenSnapshot.forEach((doc) => {
      const data = doc.data();
      const waktu = data.timestamp?.toDate?.();
      if (!waktu) return;

      const waktuWIB = new Date(waktu.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      if (waktuWIB >= awalHari && waktuWIB <= akhirHari) {
        absenHariIni = { id: doc.id, data };
      }
    });

    const jam17 = new Date(nowWIB);
    jam17.setHours(16, 0, 0, 0);

    if (absenHariIni) {
      const { timehome } = absenHariIni.data;

      if (timehome) {
        return NextResponse.json(
          { error: "User sudah absen masuk dan pulang hari ini" },
          { status: 409, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      if (nowWIB < jam17) {
        return NextResponse.json(
          { error: "Belum waktunya absen pulang. Bisa setelah jam 17:00 WIB." },
          { status: 403, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      // Absen pulang
      await firestoreAdmin.collection("absensi").doc(absenHariIni.id).update({
        timehome: firestoreTimestamp,
      });

      return NextResponse.json(
        {
          message: "Absensi pulang berhasil",
          id,
          timehome: firestoreTimestamp,
        },
        {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // Absen masuk
    const batasMasuk = new Date(nowWIB);
    batasMasuk.setHours(8, 0, 0, 0);
    const late = nowWIB > batasMasuk;

    await firestoreAdmin.collection("absensi").add({
      id,
      status: "Hadir",
      late,
      timestamp: firestoreTimestamp,
      timehome: null,
    });

    return NextResponse.json(
      {
        message: "Absensi masuk berhasil",
        id,
        late,
        status: "Hadir",
        timestamp: firestoreTimestamp,
      },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
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
