import { firestoreAdmin } from '@/app/lib/firebaseadmin';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const bulan = searchParams.get('bulan'); // format YYYY-MM

  if (!bulan) {
    return NextResponse.json(
      { success: false, error: 'Parameter bulan wajib diisi' },
      { status: 400 }
    );
  }

  const [year, month] = bulan.split('-').map(Number);
  const absensiSnapshot = await firestoreAdmin.collection('absensi').get();
  const userSnapshot = await firestoreAdmin.collection('user').get();

  const userMap = {};
  userSnapshot.docs.forEach(doc => {
    userMap[doc.data().id] = doc.data();
  });

  const absensi = absensiSnapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate?.() ?? null,
        timehome: data.timehome?.toDate?.() ?? data.timehome ?? null,
      };
    })
    .filter(item =>
      item.timestamp &&
      item.timestamp.getFullYear() === year &&
      item.timestamp.getMonth() + 1 === month
    )
    .map(item => ({
      ...item,
      nama: userMap[item.id]?.nama ?? 'Tidak Diketahui',
      jabatan: userMap[item.id]?.jabatan ?? 'Tidak Diketahui',
    }));

  return NextResponse.json({ success: true, absensi });
}
