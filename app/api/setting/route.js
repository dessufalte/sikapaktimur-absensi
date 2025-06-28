import { NextResponse } from "next/server";
import { firestoreAdmin } from "@/app/lib/firebaseadmin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // atau ganti ke origin spesifik jika perlu
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// CORS preflight handler (OPTIONS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET handler
export async function GET() {
  try {
    const doc = await firestoreAdmin.collection("settings").doc("wifi-config").get();
    const settings = doc.exists ? doc.data() : null;

    return NextResponse.json({ success: true, settings }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST handler
export async function POST(req) {
  try {
    const { wifiName, wifiPassword } = await req.json();

    if (!wifiName || !wifiPassword) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400, headers: corsHeaders }
      );
    }

    await firestoreAdmin.collection("settings").doc("wifi-config").set({
      wifiName,
      wifiPassword,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
