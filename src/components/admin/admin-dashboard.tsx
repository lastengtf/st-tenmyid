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
  RotateCcw,
  Search,
  Eye,
  Zap,
  Monitor,
  Loader2
} from "lucide-react";
import { WebApp, AccessLog, StatsSummary, AccessMode } from "@/lib/kv";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
  const [accessMode, setAccessMode] = useState<AccessMode>("redirect");
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
    setAccessMode("redirect");
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
    setAccessMode(app.accessMode || "redirect");
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
        accessMode,
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
        await fetchData();
      } else {
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
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-150">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-3 sm:px-6">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
              <GraduationCap className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-foreground">
                  st.ten.my.id
                </span>
                <Badge variant="outline" className="text-[9px] sm:text-[10px] font-normal px-1 py-0">
                  Admin
                </Badge>
              </div>
              <span className="truncate text-[10px] sm:text-[11px] text-muted-foreground">{adminEmail}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <ThemeToggle />

            <Button asChild variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs">
              <Link href="/" target="_blank">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Portal</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto flex-1 px-3 py-4 sm:px-6 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="statistik" className="gap-1 text-xs">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Statistik</span>
              </TabsTrigger>
              <TabsTrigger value="apps" className="gap-1 text-xs">
                <Globe className="h-3.5 w-3.5" />
                <span>Web / Apps</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-1 text-xs">
                <ListFilter className="h-3.5 w-3.5" />
                <span>Log</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs h-8"
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
                  className="gap-1 text-xs h-8"
                  onClick={openAddModal}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Web/App</span>
                </Button>
              )}
            </div>
          </div>

          {/* TAB 1: STATISTIK */}
          <TabsContent value="statistik" className="space-y-4 sm:space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Total Web / Apps
                  </CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.totalApps ?? apps.length}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Terdaftar di sistem st.ten.my.id
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Aplikasi Aktif
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.activeApps ?? apps.filter((a) => a.isActive).length}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Dapat diakses publik secara instan
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Total Kunjungan / Hits
                  </CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.totalClicks ?? 0}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Akumulasi klik direct & embed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Kunjungan Hari Ini
                  </CardTitle>
                  <Activity className="h-4 w-4 text-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
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
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
              {/* App Performance Ranking */}
              <Card className="border-border lg:col-span-2">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-sm font-semibold">
                    Performa Akses per Web / App
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Peringkat frekuensi akses path <code className="text-foreground">/:slug</code> oleh mahasiswa & publik.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
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
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="font-medium text-foreground truncate">{app.name}</span>
                                  <span className="font-mono text-muted-foreground">/{app.slug}</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
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
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-sm font-semibold">
                    Distribusi Kategori
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Komposisi kelompok web/app perkuliahan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="space-y-2.5">
                    {stats?.categoryDistribution &&
                    Object.keys(stats.categoryDistribution).length > 0 ? (
                      Object.entries(stats.categoryDistribution).map(([cat, count]) => (
                        <div
                          key={cat}
                          className="flex items-center justify-between rounded-md border border-border p-2 text-xs"
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
              <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Manajemen Web / Apps
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Atur nama, direct path, mode akses (Redirect / Tetap di Path), dan status aktif.
                    </CardDescription>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Cari web/app..."
                      className="pl-9 text-xs h-8"
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center">No</TableHead>
                        <TableHead>Aplikasi</TableHead>
                        <TableHead>Direct Path</TableHead>
                        <TableHead>Mode Akses</TableHead>
                        <TableHead className="hidden md:table-cell">URL Target</TableHead>
                        <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Klik</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApps.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="py-8 text-center text-xs text-muted-foreground">
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
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                                  <IconRenderer name={app.icon} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" />
                                </div>
                                <div className="flex flex-col min-w-[120px]">
                                  <span className="font-medium text-foreground text-xs sm:text-sm">{app.name}</span>
                                  <span className="line-clamp-1 text-[10px] sm:text-[11px] text-muted-foreground">
                                    {app.description}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/${app.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-foreground hover:underline whitespace-nowrap"
                              >
                                <span>/{app.slug}</span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </Link>
                            </TableCell>
                            <TableCell>
                              {app.accessMode === "embed" ? (
                                <Badge variant="secondary" className="gap-1 text-[10px] whitespace-nowrap">
                                  <Monitor className="h-2.5 w-2.5" />
                                  <span>Tetap di Path</span>
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 text-[10px] whitespace-nowrap">
                                  <Zap className="h-2.5 w-2.5" />
                                  <span>Direct Redirect</span>
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-[180px] truncate text-xs text-muted-foreground">
                              <a
                                href={app.targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline"
                              >
                                {app.targetUrl}
                              </a>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="outline" className="text-[10px] sm:text-[11px]">
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
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => openEditModal(app)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: LOG PENGUNJUNG */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Log Aktivitas Kunjungan
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Rekaman jejak pengunjung yang mengakses path <code className="text-foreground">/:slug</code>.
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
                      className="gap-1 text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleClearLogs}
                      disabled={logs.length === 0}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Kosongkan</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead className="hidden md:table-cell">Target URL</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead className="hidden sm:table-cell">Browser</TableHead>
                        <TableHead className="hidden lg:table-cell">Referer</TableHead>
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
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                /{log.slug}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-[180px] truncate text-xs text-muted-foreground">
                              {log.targetUrl}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {log.ip}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-xs text-muted-foreground">
                              {log.userAgent}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell max-w-[120px] truncate text-xs text-muted-foreground">
                              {log.referer}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* DIALOG MODAL: TAMBAH / EDIT WEB / APP */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[88vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingId ? "Edit Web / App Perkuliahan" : "Tambah Web / App Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Daftarkan layanan perkuliahan baru atau ubah direct route & mode akses yang diinginkan.
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
                  <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-2.5 text-xs text-muted-foreground shrink-0">
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
                Target URL (Tujuan Aplikasi)
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

            {/* Mode Akses (Direct vs Embed) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Mode Akses Path (<span className="font-mono text-muted-foreground">st.ten.my.id/:slug</span>)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={accessMode === "redirect" ? "default" : "outline"}
                  size="sm"
                  className="flex flex-col items-start h-auto p-2.5 text-left text-xs gap-0.5"
                  onClick={() => setAccessMode("redirect")}
                >
                  <div className="flex items-center gap-1 font-semibold">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>Direct Redirect</span>
                  </div>
                  <span className="text-[10px] opacity-80 font-normal">
                    Pengunjung langsung diarahkan ke target URL.
                  </span>
                </Button>

                <Button
                  type="button"
                  variant={accessMode === "embed" ? "default" : "outline"}
                  size="sm"
                  className="flex flex-col items-start h-auto p-2.5 text-left text-xs gap-0.5"
                  onClick={() => setAccessMode("embed")}
                >
                  <div className="flex items-center gap-1 font-semibold">
                    <Monitor className="h-3.5 w-3.5 text-blue-500" />
                    <span>Tetap di Path</span>
                  </div>
                  <span className="text-[10px] opacity-80 font-normal">
                    Tampil tersemat di path st.ten.my.id/:slug.
                  </span>
                </Button>
              </div>
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
                className="h-16 text-xs"
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

            <DialogFooter className="pt-2 sm:pt-3">
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
