import { NextResponse } from "next/server";
import { firestoreAdmin } from "@/app/lib/firebaseadmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, status, tanggal } = body;

    if (!userId || !status || !tanggal) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 });
    }

    await firestoreAdmin.collection("absensi").add({
      id: userId,
      status,
      timestamp: new Date(tanggal), 
      late: false,
      timehome: null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
