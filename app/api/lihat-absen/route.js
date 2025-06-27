import { NextResponse } from "next/server";
import { firestoreAdmin } from "@/app/lib/firebaseadmin";

export async function GET() {
  try {
    const snapshot = await firestoreAdmin.collection("absensi").get();
    const data = snapshot.docs.map((doc) => ({
      idDoc: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, data }); 
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 } 
    );
  }
}
