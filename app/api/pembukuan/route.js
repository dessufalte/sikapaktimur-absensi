import { firestoreAdmin } from '@/app/lib/firebaseadmin';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

export async function POST() {
  try {
    // Gunakan tanggal hari ini (WIB, jika ingin, bisa ditambahkan offset 7 jam)
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setHours(0, 0, 0, 0);

    // Ambil semua user
    const userSnapshot = await firestoreAdmin.collection('user').get();
    const users = userSnapshot.docs.map((doc) => doc.data());

    // Ambil semua absensi
    const absensiSnapshot = await firestoreAdmin.collection('absensi').get();

    // Filter absensi hari ini
    const absensiHariIni = absensiSnapshot.docs.filter((doc) => {
      const waktu = doc.data().timestamp?.toDate?.();
      if (!waktu) return false;
      const t = new Date(waktu);
      t.setHours(0, 0, 0, 0);
      return t.getTime() === targetDate.getTime();
    });

    const userIdsHadir = new Set(absensiHariIni.map((doc) => doc.data().id.toString()));

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
      const userId = user.id.toString();

      if (!userIdsHadir.has(userId)) {
        // Cek apakah user sudah punya data hari ini (safety double check)
        const sudahAda = absensiHariIni.some(doc => doc.data().id.toString() === userId);
        if (!sudahAda) {
          batch.set(absensiRef.doc(), {
            id: user.id,
            status: 'Alfa',
            late: false,
            timestamp: Timestamp.fromDate(new Date()),
          });
          count++;
        }
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
