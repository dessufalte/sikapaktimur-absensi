import { firestoreAdmin } from '@/app/lib/firebaseadmin';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

export async function POST() {
  try {
    const now = new Date();
    const nowWIB = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const targetDate = new Date(nowWIB);
    targetDate.setHours(0, 0, 0, 0); // Hari ini WIB jam 00:00

    const userSnapshot = await firestoreAdmin.collection('user').get();
    const users = userSnapshot.docs.map((doc) => doc.data());

    const absensiSnapshot = await firestoreAdmin.collection('absensi').get();

    const absensiHariIni = absensiSnapshot.docs.filter((doc) => {
      const waktu = doc.data().timestamp?.toDate?.();
      if (!waktu) return false;

      // ✅ Konversi ke WIB
      const waktuWIB = new Date(waktu.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      waktuWIB.setHours(0, 0, 0, 0);
      return waktuWIB.getTime() === targetDate.getTime();
    });

    const userIdsHadir = new Set(absensiHariIni.map((doc) => doc.data().id?.toString()));

    if (userIdsHadir.size === users.length) {
      return NextResponse.json({
        error: 'Semua user sudah absen hari ini. Tidak perlu pembukuan.',
      }, { status: 409 });
    }

    const batch = firestoreAdmin.batch();
    const absensiRef = firestoreAdmin.collection('absensi');
    const Timestamp = admin.firestore.Timestamp;

    let count = 0;
    for (const user of users) {
      const userId = user.id?.toString();
      const sudahAda = absensiHariIni.some(
        (doc) => doc.data().id?.toString() === userId
      );

      if (!sudahAda) {
        batch.set(absensiRef.doc(), {
          id: user.id,
          status: 'Alfa',
          late: false,
          timestamp: Timestamp.fromDate(new Date()),
          timehome: null,
        });
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Pembukuan selesai. ${count} user ditandai Alfa.`,
    });

  } catch (err) {
    console.error('Error pembukuan:', err);
    return NextResponse.json({ error: 'Gagal melakukan pembukuan' }, { status: 500 });
  }
}
