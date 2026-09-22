import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getRecentLogs, clearRecentLogs } from "@/lib/kv";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await getRecentLogs();
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data log" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await clearRecentLogs();
    return NextResponse.json({ success: true, message: "Log berhasil dibersihkan" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal membersihkan log" },
      { status: 500 }
    );
  }
}
