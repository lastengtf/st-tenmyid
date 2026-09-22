import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  GraduationCap,
  ExternalLink,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { getAppBySlug, recordAppClick } from "@/lib/kv";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconRenderer } from "@/components/portal/icon-renderer";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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

  // If found and active:
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

    // Check Access Mode: if "embed", render the integrated path frame view
    if (app.accessMode === "embed") {
      return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
          {/* Integrated Portal Bar */}
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur-xs sm:h-13 sm:px-4">
            <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                <Link href="/">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Portal</span>
                </Link>
              </Button>

              <div className="h-4 w-px bg-border shrink-0" />

              <div className="flex items-center space-x-2 truncate">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <IconRenderer name={app.icon} className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="truncate text-xs font-semibold text-foreground sm:text-sm">
                    {app.name}
                  </span>
                </div>
              </div>

              <Badge variant="outline" className="hidden md:inline-flex text-[10px] font-mono shrink-0">
                st.ten.my.id/{app.slug}
              </Badge>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <ThemeToggle />

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs"
                title="Buka langsung di tab baru"
              >
                <a
                  href={app.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="hidden sm:inline">Tab Baru</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </header>

          {/* Embedded Web / App Viewport */}
          <main className="relative flex-1 w-full h-[calc(100vh-3rem)] overflow-hidden bg-muted/20">
            <iframe
              src={app.targetUrl}
              title={app.name}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </main>
        </div>
      );
    }

    // Default mode: "redirect" (Direct redirect to the registered target URL)
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
