import { firestoreAdmin } from "@/app/lib/firebaseadmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, nama, jabatan } = body;

    if (typeof id !== "number" || !nama || !jabatan) {
      return NextResponse.json(
        { error: "ID (number), nama, dan jabatan wajib diisi" },
        { status: 400 }
      );
    }

    // Gunakan ID sebagai nama dokumen agar unik
    const userRef = firestoreAdmin.collection("user").doc(String(id));

    // Akan throw error jika doc sudah ada
    await userRef.create({
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
    if (err.code === 6 || err.message?.includes("Already exists")) {
      // Firestore error code 6 = ALREADY_EXISTS
      return NextResponse.json(
        { error: "ID sudah terdaftar" },
        { status: 409 }
      );
    }

    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
