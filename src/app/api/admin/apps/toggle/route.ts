import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { toggleAppStatus } from "@/lib/kv";

export async function POST(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, isActive } = await request.json();
    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "ID dan status isActive wajib diisi." },
        { status: 400 }
      );
    }

    const updated = await toggleAppStatus(id, isActive);
    if (!updated) {
      return NextResponse.json(
        { error: "Aplikasi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, app: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengubah status aplikasi" },
      { status: 500 }
    );
  }
}
