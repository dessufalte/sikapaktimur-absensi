import { firestoreAdmin } from "@/app/lib/firebaseadmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, nama, jabatan } = body;

    // Validasi input
    if (typeof id !== "number" || !nama || !jabatan) {
      return NextResponse.json(
        { error: "ID (number), nama, dan jabatan wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah ID sudah terdaftar
    const existing = await firestoreAdmin
      .collection("user")
      .where("id", "==", id)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "ID sudah terdaftar" },
        { status: 409 }
      );
    }

    // Simpan ke Firestore
    await firestoreAdmin.collection("user").add({
      id,
      nama,
      jabatan,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "User berhasil ditambahkan" },
      { status: 201 }
    );
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
