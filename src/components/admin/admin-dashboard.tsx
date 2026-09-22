"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Globe,
  ListFilter,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  LogOut,
  GraduationCap,
  Activity,
  MousePointerClick,
  CheckCircle,
  XCircle,
  RotateCcw,
  Search,
  Eye,
  Calendar,
  Cpu,
  BookOpen,
  FolderKanban,
  Wrench,
  Database,
  Code,
  Compass,
  Terminal,
  Rocket,
  Layers,
  Sparkles,
  Loader2
} from "lucide-react";
import { WebApp, AccessLog, StatsSummary } from "@/lib/kv";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { IconRenderer } from "@/components/portal/icon-renderer";

const AVAILABLE_ICONS = [
  "Calendar",
  "Cpu",
  "BookOpen",
  "FolderKanban",
  "Wrench",
  "Layers",
  "Globe",
  "ExternalLink",
  "Database",
  "Code",
  "Compass",
  "Terminal",
  "Rocket",
];

const PRESET_CATEGORIES = [
  "Akademik",
  "Jadwal & Kuliah",
  "Lab & Praktikum",
  "Tugas & Proyek",
  "Resource & Tools",
  "Umum",
];

export function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("statistik");
  const [apps, setApps] = useState<WebApp[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters in Admin
  const [appSearch, setAppSearch] = useState<string>("");
  const [logFilterApp, setLogFilterApp] = useState<string>("all");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Akademik");
  const [icon, setIcon] = useState<string>("Calendar");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<number>(1);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [appsRes, logsRes, statsRes] = await Promise.all([
        fetch("/api/admin/apps"),
        fetch("/api/admin/logs"),
        fetch("/api/admin/stats"),
      ]);

      if (appsRes.status === 401 || logsRes.status === 401) {
        router.push("/login");
        return;
      }

      const appsData = await appsRes.json();
      const logsData = await logsRes.json();
      const statsData = await statsRes.json();

      setApps(appsData.apps || []);
      setLogs(logsData.logs || []);
      setStats(statsData.stats || null);
    } catch (err) {
      console.error("Gagal memuat data admin:", err);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingId(null);
    setName("");
    setSlug("");
    setTargetUrl("");
    setDescription("");
    setCategory("Akademik");
    setIcon("Calendar");
    setIsActive(true);
    setSortOrder(apps.length + 1);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(app: WebApp) {
    setEditingId(app.id);
    setName(app.name);
    setSlug(app.slug);
    setTargetUrl(app.targetUrl);
    setDescription(app.description);
    setCategory(app.category);
    setIcon(app.icon || "ExternalLink");
    setIsActive(app.isActive);
    setSortOrder(app.sortOrder);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSaveApp(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const payload = {
        id: editingId || undefined,
        name,
        slug,
        targetUrl,
        description,
        category,
        icon,
        isActive,
        sortOrder,
      };

      const res = await fetch("/api/admin/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal menyimpan data aplikasi");
        setFormLoading(false);
        return;
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError("Terjadi kegagalan jaringan saat menyimpan.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleStatus(app: WebApp) {
    const newStatus = !app.isActive;
    // Optimistic UI update
    setApps((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, isActive: newStatus } : a))
    );

    try {
      const res = await fetch("/api/admin/apps/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id, isActive: newStatus }),
      });
      if (!res.ok) {
        await fetchData(); // rollback on error
      } else {
        // Refresh stats
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
      }
    } catch {
      await fetchData();
    }
  }

  async function handleDeleteApp(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus web/app ini?")) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/apps?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
      } else {
        alert("Gagal menghapus aplikasi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(null);
    }
  }

  async function handleClearLogs() {
    if (!confirm("Apakah Anda yakin ingin mengosongkan seluruh riwayat log pengunjung?"))
      return;

    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) {
        setLogs([]);
      } else {
        alert("Gagal mengosongkan log.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  }

  // Filtered lists
  const filteredApps = apps.filter((app) => {
    return (
      app.name.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.slug.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.category.toLowerCase().includes(appSearch.toLowerCase())
    );
  });

  const filteredLogs = logs.filter((log) => {
    if (logFilterApp === "all") return true;
    return log.slug.toLowerCase() === logFilterApp.toLowerCase();
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
              <GraduationCap className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  st.ten.my.id
                </span>
                <Badge variant="outline" className="text-[10px] font-normal">
                  Admin Panel
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">{adminEmail}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
              <Link href="/" target="_blank">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Pratinjau Portal</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto flex-1 px-4 py-6 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="statistik" className="gap-1.5 text-xs">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Statistik</span>
              </TabsTrigger>
              <TabsTrigger value="apps" className="gap-1.5 text-xs">
                <Globe className="h-3.5 w-3.5" />
                <span>Web / Apps</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-1.5 text-xs">
                <ListFilter className="h-3.5 w-3.5" />
                <span>Log Pengunjung</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={fetchData}
                disabled={loading}
              >
                <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Segarkan</span>
              </Button>
              {activeTab === "apps" && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={openAddModal}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Web/App</span>
                </Button>
              )}
            </div>
          </div>

          {/* TAB 1: STATISTIK */}
          <TabsContent value="statistik" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Total Web / Apps
                  </CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.totalApps ?? apps.length}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Terdaftar di sistem st.ten.my.id
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Aplikasi Aktif
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.activeApps ?? apps.filter((a) => a.isActive).length}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Dapat diakses publik secara instan
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Total Direct Access
                  </CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.totalClicks ?? 0}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Akumulasi klik & direct redirect
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Kunjungan Hari Ini
                  </CardTitle>
                  <Activity className="h-4 w-4 text-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.clicksToday ?? 0}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Catatan hit 24 jam terakhir
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Rankings & Category Distribution */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* App Performance Ranking */}
              <Card className="border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Performa Akses per Web / App
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Peringkat frekuensi akses direct path <code className="text-foreground">/:slug</code> oleh mahasiswa & publik.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {apps.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      Belum ada aplikasi yang terdaftar.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...apps]
                        .sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0))
                        .map((app) => {
                          const total = stats?.totalClicks || 1;
                          const percentage = Math.min(
                            100,
                            Math.round(((app.clicksCount || 0) / (total === 0 ? 1 : total)) * 100)
                          );
                          return (
                            <div key={app.id} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">{app.name}</span>
                                  <span className="font-mono text-muted-foreground">/{app.slug}</span>
                                </div>
                                <div className="flex items-center gap-2 font-mono text-xs">
                                  <span className="font-semibold text-foreground">
                                    {app.clicksCount || 0}
                                  </span>
                                  <span className="text-muted-foreground">klik</span>
                                </div>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-md bg-muted">
                                <div
                                  className="h-full rounded-md bg-primary transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Distribusi Kategori
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Komposisi kelompok web/app perkuliahan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.categoryDistribution &&
                    Object.keys(stats.categoryDistribution).length > 0 ? (
                      Object.entries(stats.categoryDistribution).map(([cat, count]) => (
                        <div
                          key={cat}
                          className="flex items-center justify-between rounded-md border border-border p-2.5 text-xs"
                        >
                          <span className="font-medium text-foreground">{cat}</span>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {count} App
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        Belum ada kategori terdata.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: WEB / APPS CRUD */}
          <TabsContent value="apps" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Manajemen Web / Apps
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Kelola daftar aplikasi perkuliahan, pengaturan direct path, URL tujuan, dan status aktif.
                    </CardDescription>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Cari web/app..."
                      className="pl-9 text-xs"
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">Urutan</TableHead>
                      <TableHead>Aplikasi</TableHead>
                      <TableHead>Direct Path</TableHead>
                      <TableHead>URL Tujuan</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Total Klik</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                          Tidak ada aplikasi yang sesuai.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApps.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">
                            {app.sortOrder}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                                <IconRenderer name={app.icon} className="h-4 w-4 text-foreground" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{app.name}</span>
                                <span className="line-clamp-1 text-[11px] text-muted-foreground">
                                  {app.description}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/${app.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-foreground hover:underline"
                            >
                              <span>/{app.slug}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            <a
                              href={app.targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline"
                            >
                              {app.targetUrl}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[11px]">
                              {app.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={app.isActive}
                                onCheckedChange={() => handleToggleStatus(app)}
                                aria-label="Toggle aktifasi"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold">
                            {app.clicksCount || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => openEditModal(app)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteApp(app.id)}
                                disabled={isDeleting === app.id}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: LOG PENGUNJUNG */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Log Aktivitas Kunjungan
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Rekaman jejak pengunjung yang mengakses direct path <code className="text-foreground">/:slug</code>.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={logFilterApp}
                      onChange={(e) => setLogFilterApp(e.target.value)}
                    >
                      <option value="all">Semua Aplikasi</option>
                      {apps.map((app) => (
                        <option key={app.id} value={app.slug}>
                          /{app.slug} ({app.name})
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleClearLogs}
                      disabled={logs.length === 0}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Kosongkan Log</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu Akses</TableHead>
                      <TableHead>Path / Slug</TableHead>
                      <TableHead>Target Redirect</TableHead>
                      <TableHead>IP Pengunjung</TableHead>
                      <TableHead>Browser / User Agent</TableHead>
                      <TableHead>Referer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                          Belum ada aktivitas kunjungan yang tercatat.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              /{log.slug}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {log.targetUrl}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {log.ip}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                            {log.userAgent}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                            {log.referer}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* DIALOG MODAL: TAMBAH / EDIT WEB / APP */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingId ? "Edit Web / App Perkuliahan" : "Tambah Web / App Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Daftarkan layanan perkuliahan baru atau ubah direct route ke target URL yang diinginkan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveApp} className="space-y-4 pt-2">
            {formError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="appName" className="text-xs font-medium">
                Nama Web / App
              </Label>
              <Input
                id="appName"
                placeholder="Contoh: Jadwal Perkuliahan & Kelas"
                className="text-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="appSlug" className="text-xs font-medium">
                  Direct Path / Slug (<span className="text-muted-foreground">/:slug</span>)
                </Label>
                <div className="flex items-center">
                  <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-2.5 text-xs text-muted-foreground">
                    st.ten.my.id/
                  </span>
                  <Input
                    id="appSlug"
                    placeholder="jadkel"
                    className="rounded-l-none text-xs"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appOrder" className="text-xs font-medium">
                  Urutan Tampilan
                </Label>
                <Input
                  id="appOrder"
                  type="number"
                  min="1"
                  className="text-xs"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="targetUrl" className="text-xs font-medium">
                Target URL (Tujuan Redirect)
              </Label>
              <Input
                id="targetUrl"
                type="url"
                placeholder="https://jadwal.ten.my.id"
                className="text-xs"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-medium">
                  Kategori
                </Label>
                <select
                  id="category"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="icon" className="text-xs font-medium">
                  Ikon (Lucide)
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                    <IconRenderer name={icon} className="h-4 w-4 text-foreground" />
                  </div>
                  <select
                    id="icon"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium">
                Deskripsi Singkat
              </Label>
              <Textarea
                id="description"
                placeholder="Jelaskan fungsi atau materi yang disediakan oleh aplikasi ini..."
                className="h-20 text-xs"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="modalIsActive" className="text-xs font-medium">
                  Status Aktif
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Aplikasi dapat diakses publik via direct route dan muncul di portal.
                </p>
              </div>
              <Switch
                id="modalIsActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="text-xs"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{editingId ? "Perbarui Aplikasi" : "Simpan Aplikasi"}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
