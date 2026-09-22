"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldAlert, ArrowRight, Loader2, GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Login gagal. Silakan periksa kredensial Anda.");
        setLoading(false);
        return;
      }

      router.push(from);
      router.refresh();
    } catch (err: any) {
      setErrorMessage("Terjadi gangguan jaringan saat mencoba login.");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm border-border shadow-md">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center">
          <Badge variant="outline" className="text-[11px] font-normal">
            Akses Terbatas Administrator
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          Masuk ke Panel Admin
        </CardTitle>
        <CardDescription className="text-xs">
          Masukkan kredensial administrator Anda untuk mengelola direktori dan melihat statistik.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <ShieldAlert className="h-4 w-4 shrink-0 translate-y-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              Email Administrator
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@st.ten.my.id"
                className="pl-9 text-xs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">
                Kata Sandi
              </Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                className="pl-9 text-xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            type="submit"
            variant="default"
            size="sm"
            className="w-full justify-center gap-2 text-xs"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Panel</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="mb-6 flex items-center space-x-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted">
          <GraduationCap className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            st.ten.my.id
          </span>
          <span className="text-xs text-muted-foreground">
            Sarjana Teknik Admin Portal
          </span>
        </div>
      </div>

      <Suspense
        fallback={
          <Card className="w-full max-w-sm border-border p-8 text-center text-xs text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-muted-foreground" />
            <span>Memuat formulir autentikasi...</span>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        Halaman ini tidak terindeks publik &bull; Proteksi Keamanan Cloudflare
      </div>
    </div>
  );
}
