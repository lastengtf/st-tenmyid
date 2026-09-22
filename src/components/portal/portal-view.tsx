"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  GraduationCap,
  CheckCircle2,
  Globe,
  Sparkles,
  Layers,
  Zap,
  Monitor
} from "lucide-react";
import { WebApp } from "@/lib/kv";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconRenderer } from "@/components/portal/icon-renderer";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-150">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-3 sm:px-6">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
              <GraduationCap className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                st.ten.my.id
              </span>
              <span className="text-[11px] text-muted-foreground leading-none">
                Sarjana Teknik Portal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="hidden sm:inline-flex items-center gap-1 text-[11px]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </Badge>

            {/* Theme Toggle Button (Light/Dark) */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto flex-1 px-3 py-6 sm:px-6 sm:py-10">
        {/* Hero Section */}
        <section className="mb-8 flex flex-col items-center text-center sm:mb-12">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span>Pusat Integrasi Web & Apps Perkuliahan Teknik</span>
          </div>

          <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Sistem Portal Sarjana Teknik
          </h1>

          <p className="mt-2.5 max-w-2xl text-xs sm:text-base text-muted-foreground">
            Gerbang akses terpusat untuk aplikasi, agenda perkuliahan, modul laboratorium, dan perangkat rekayasa keteknikan.
          </p>

          {/* Search & Category Filter Section */}
          <div className="mt-6 flex w-full max-w-xl flex-col gap-3 sm:mt-8 sm:gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari aplikasi, mata kuliah, topik, atau path..."
                className="pl-9 pr-4 text-xs sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Pills (Mobile horizontal swipeable) */}
            <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Button
                    key={cat}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="shrink-0 h-7 px-2.5 text-xs sm:h-8 sm:px-3 transition-colors duration-150"
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
        <section className="mb-10 sm:mb-12">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
                Daftar Aplikasi ({filteredApps.length})
              </h2>
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted">
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-foreground sm:text-base">
                Tidak ada aplikasi yang cocok
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Coba sesuaikan kata kunci pencarian atau pilih kategori lain.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Semua");
                }}
              >
                Reset Filter
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {filteredApps.map((app) => (
                <Card
                  key={app.id}
                  className="flex flex-col justify-between border-border transition-all duration-150 hover:border-foreground/30 hover:bg-muted/10"
                >
                  <CardHeader className="space-y-2.5 p-4 pb-2 sm:space-y-3 sm:p-6 sm:pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-foreground sm:h-10 sm:w-10">
                        <IconRenderer name={app.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] sm:text-[11px] font-normal"
                        >
                          {app.category}
                        </Badge>
                        {app.accessMode === "embed" ? (
                          <Badge
                            variant="outline"
                            className="hidden sm:inline-flex text-[9px] text-muted-foreground gap-0.5"
                            title="Aplikasi tampil langsung di dalam path st.ten.my.id"
                          >
                            <Monitor className="h-2.5 w-2.5" />
                            <span>Path</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="hidden sm:inline-flex text-[9px] text-muted-foreground gap-0.5"
                            title="Direct redirect ke URL tujuan"
                          >
                            <Zap className="h-2.5 w-2.5" />
                            <span>Direct</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground sm:text-base">
                        {app.name}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                        <span className="text-muted-foreground/60">st.ten.my.id/</span>
                        <span className="font-semibold text-foreground">{app.slug}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 pb-3 sm:px-6 sm:pb-4">
                    <CardDescription className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:line-clamp-3">
                      {app.description || "Layanan digital perkuliahan sarjana teknik terintegrasi."}
                    </CardDescription>
                  </CardContent>

                  <CardFooter className="border-t border-border p-3 px-4 sm:p-4 sm:px-6">
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="w-full justify-between text-xs"
                    >
                      <Link
                        href={`/${app.slug}`}
                        target={app.accessMode === "embed" ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                      >
                        <span>
                          {app.accessMode === "embed" ? "Buka di Path" : "Akses Langsung"}
                        </span>
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
        <section className="border-t border-border pt-6 sm:pt-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
            <Card className="border-border bg-card/50 p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Fleksibel: Direct & In-Path
                  </h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Pilihan redirect instan atau disematkan langsung di dalam <code className="text-foreground">/:slug</code>.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card/50 p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <Globe className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Ekosistem Sarjana Teknik
                  </h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Menghubungkan seluruh subsistem perkuliahan ke dalam satu pintu.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card/50 p-3.5 sm:p-4 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <Sparkles className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Tema Terang & Gelap
                  </h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Tampilan responsif dan nyaman di mata untuk mobile dan desktop.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-5 sm:py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">st.ten.my.id</span>. Platform Sarjana Teknik TEN.
          </div>
          <div className="text-[11px] text-muted-foreground">
            Minimalist SaaS Architecture &bull; Linear Aesthetic
          </div>
        </div>
      </footer>
    </div>
  );
}
