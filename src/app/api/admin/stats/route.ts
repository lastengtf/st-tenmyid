import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getStatsSummary } from "@/lib/kv";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getStatsSummary();
    return NextResponse.json({ stats });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}
