"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ExternalLink, ArrowUpRight, GraduationCap, CheckCircle2, Globe, Sparkles, Layers } from "lucide-react";
import { WebApp } from "@/lib/kv";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconRenderer } from "@/components/portal/icon-renderer";

interface PortalViewProps {
  apps: WebApp[];
}

export function PortalView({ apps }: PortalViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    apps.forEach((app) => {
      if (app.category) set.add(app.category);
    });
    return ["Semua", ...Array.from(set)];
  }, [apps]);

  // Filter apps (only active ones for public)
  const filteredApps = useMemo(() => {
    return apps
      .filter((app) => app.isActive)
      .filter((app) => {
        const matchesCategory =
          selectedCategory === "Semua" || app.category === selectedCategory;
        const matchesSearch =
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.slug.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
  }, [apps, searchQuery, selectedCategory]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top subtle bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
              <GraduationCap className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                st.ten.my.id
              </span>
              <span className="text-xs text-muted-foreground">
                Sarjana Teknik Portal
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Portal Online
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:py-12">
        {/* Hero Section */}
        <section className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span>Pusat Integrasi Web & Apps Perkuliahan Teknik</span>
          </div>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Sistem Portal Sarjana Teknik
          </h1>

          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
            Gerbang akses terpusat untuk aplikasi, agenda perkuliahan, modul laboratorium, dan perangkat rekayasa keteknikan.
          </p>

          {/* Search & Category Filter Section */}
          <div className="mt-8 flex w-full max-w-xl flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari web/app, topik perkuliahan, atau path..."
                className="pl-9 pr-4 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Button
                    key={cat}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="text-xs transition-colors duration-150"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Apps Grid */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Daftar Aplikasi ({filteredApps.length})
              </h2>
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
                <Globe className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-medium text-foreground">
                Tidak ada aplikasi yang cocok
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Coba sesuaikan kata kunci pencarian atau pilih kategori lain.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Semua");
                }}
              >
                Reset Filter
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredApps.map((app) => (
                <Card
                  key={app.id}
                  className="flex flex-col justify-between border-border transition-all duration-150 hover:border-foreground/30 hover:bg-muted/10"
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                        <IconRenderer name={app.icon} className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-[11px] font-normal">
                        {app.category}
                      </Badge>
                    </div>

                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">
                        {app.name}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <span className="text-muted-foreground/60">st.ten.my.id/</span>
                        <span className="font-semibold text-foreground">{app.slug}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <CardDescription className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {app.description || "Layanan digital perkuliahan sarjana teknik terintegrasi."}
                    </CardDescription>
                  </CardContent>

                  <CardFooter className="border-t border-border pt-3">
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="w-full justify-between text-xs"
                    >
                      <Link href={`/${app.slug}`} target="_blank" rel="noopener noreferrer">
                        <span>Akses Portal</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Information Grid / Features */}
        <section className="border-t border-border pt-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-border bg-card/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Direct Routing Cepat
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Akses instan melalui format URL singkat <code className="text-foreground">/:slug</code>.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <Globe className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Ekosistem Sarjana Teknik
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Menghubungkan seluruh subsistem perkuliahan ke dalam satu pintu.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <ExternalLink className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Cloudflare Edge Ready
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Di-deploy secara global dengan latensi minimal dan ketersediaan tinggi.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">st.ten.my.id</span>. Platform Sarjana Teknik TEN.
          </div>
          <div className="text-xs text-muted-foreground">
            Minimalist SaaS Architecture &bull; Linear Aesthetic
          </div>
        </div>
      </footer>
    </div>
  );
}
