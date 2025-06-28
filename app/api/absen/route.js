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

    const now = new Date();
    const firestoreTimestamp = admin.firestore.Timestamp.fromDate(now);

    // Cari user
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

    const awalHari = new Date(now);
    awalHari.setHours(0, 0, 0, 0);
    const akhirHari = new Date(now);
    akhirHari.setHours(23, 59, 59, 999);

    // Ambil data absensi hari ini
    const absenSnapshot = await firestoreAdmin
      .collection("absensi")
      .where("id", "==", id)
      .get();

    let absenHariIni = null;

    absenSnapshot.forEach((doc) => {
      const data = doc.data();
      const waktu = data.timestamp?.toDate?.() || new Date(data.timestamp);
      if (waktu >= awalHari && waktu <= akhirHari) {
        absenHariIni = { id: doc.id, data };
      }
    });

    const jam17 = new Date(now);
    jam17.setHours(17, 0, 0, 0);

    if (absenHariIni) {
      const { timehome } = absenHariIni.data;

      // Sudah absen dan sudah pulang
      if (timehome) {
        return NextResponse.json(
          { error: "User sudah absen masuk dan pulang hari ini" },
          { status: 409, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      // Belum waktunya pulang
      if (now < jam17) {
        return NextResponse.json(
          { error: "Belum waktunya absen pulang. Bisa setelah jam 17:00." },
          { status: 403, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      // Waktu pulang: update timehome
      await firestoreAdmin
        .collection("absensi")
        .doc(absenHariIni.id)
        .update({
          timehome: firestoreTimestamp,
        });

      return NextResponse.json(
        {
          message: "Absen pulang berhasil",
          id,
          timehome: firestoreTimestamp,
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Belum absen hari ini → absen masuk
    const batasMasuk = new Date(now);
    batasMasuk.setHours(8, 0, 0, 0);
    const late = now > batasMasuk;
    const statusAbsen = "Hadir";

    await firestoreAdmin.collection("absensi").add({
      id,
      status: statusAbsen,
      late,
      timestamp: firestoreTimestamp,
      timehome: null,
    });

    return NextResponse.json(
      {
        message: "Absensi masuk berhasil",
        id,
        late,
        status: statusAbsen,
        timestamp: firestoreTimestamp,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
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
