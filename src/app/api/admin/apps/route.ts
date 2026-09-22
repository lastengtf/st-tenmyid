import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getAllApps, saveApp, deleteApp } from "@/lib/kv";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apps = await getAllApps();
    return NextResponse.json({ apps });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data aplikasi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, slug, targetUrl, description, category, icon, isActive, sortOrder } =
      body;

    if (!name || !slug || !targetUrl) {
      return NextResponse.json(
        { error: "Nama, slug path, dan target URL wajib diisi." },
        { status: 400 }
      );
    }

    const saved = await saveApp({
      id,
      name,
      slug,
      targetUrl,
      description: description || "",
      category: category || "Umum",
      icon: icon || "ExternalLink",
      isActive: isActive !== false,
      sortOrder: Number(sortOrder) || 0,
    });

    return NextResponse.json({ success: true, app: saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan aplikasi" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID aplikasi dibutuhkan" }, { status: 400 });
    }

    const success = await deleteApp(id);
    if (!success) {
      return NextResponse.json(
        { error: "Aplikasi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal menghapus aplikasi" },
      { status: 500 }
    );
  }
}
