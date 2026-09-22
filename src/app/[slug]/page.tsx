import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, GraduationCap } from "lucide-react";
import { getAppBySlug, recordAppClick } from "@/lib/kv";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SlugRedirectPage({ params }: SlugPageProps) {
  const { slug } = await params;

  // Reserved paths guard
  if (["login", "admin", "api"].includes(slug.toLowerCase())) {
    notFound();
  }

  const app = await getAppBySlug(slug);

  // If found and active, record visit log and redirect
  if (app && app.isActive) {
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0].trim() ||
      headerList.get("cf-connecting-ip") ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "Direct / Unknown";
    const referer = headerList.get("referer") || "Direct";

    try {
      await recordAppClick(app, { ip, userAgent, referer });
    } catch (err) {
      console.error("Failed to record click:", err);
    }

    // Direct redirect to the registered target URL
    redirect(app.targetUrl);
  }

  // If not found or inactive, display clean error screen
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="mb-6 flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
          <GraduationCap className="h-4 w-4 text-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          st.ten.my.id
        </span>
      </div>

      <Card className="w-full max-w-md border-border text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex justify-center">
            <Badge variant="outline" className="text-xs">
              Direct Route 404
            </Badge>
          </div>
          <CardTitle className="mt-2 text-lg font-bold">
            Web/App Tidak Ditemukan
          </CardTitle>
          <CardDescription className="text-xs">
            Path <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">/{slug}</code> tidak terdaftar atau sedang dinonaktifkan oleh administrator.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4 text-xs text-muted-foreground">
          Pastikan alamat URL yang Anda masukkan sudah benar, atau kunjungi portal utama untuk melihat direktori aplikasi perkuliahan sarjana teknik yang aktif.
        </CardContent>

        <CardFooter className="pt-2">
          <Button asChild variant="default" size="sm" className="w-full gap-2 text-xs">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Beranda Portal</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
