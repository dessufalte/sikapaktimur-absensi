// app/api/lihat-user/route.js
import { firestoreAdmin } from "@/app/lib/firebaseadmin";

export async function GET() {
  try {
    const snapshot = await firestoreAdmin.collection("user").get();
    const data = snapshot.docs.map((doc) => ({
      idDoc: doc.id,
      ...doc.data(),
    }));

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
