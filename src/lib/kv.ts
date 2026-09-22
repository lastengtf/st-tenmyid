import fs from "fs";
import path from "path";

export interface WebApp {
  id: string;
  name: string;
  slug: string;
  targetUrl: string;
  description: string;
  category: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  clicksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccessLog {
  id: string;
  appId: string;
  appName: string;
  slug: string;
  targetUrl: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  referer: string;
}

export interface StatsSummary {
  totalApps: number;
  activeApps: number;
  totalClicks: number;
  clicksToday: number;
  categoryDistribution: Record<string, number>;
}

// Initial seed data for Sarjana Teknik portal
const INITIAL_APPS: WebApp[] = [
  {
    id: "app_jadkel",
    name: "Jadwal Perkuliahan & Kelas",
    slug: "jadkel",
    targetUrl: "https://jadwal.ten.my.id",
    description:
      "Portal manajemen jadwal kuliah mingguan, informasi ruangan, agenda kelas, dan pengumuman dosen sarjana teknik.",
    category: "Jadwal & Kuliah",
    icon: "Calendar",
    isActive: true,
    sortOrder: 1,
    clicksCount: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "app_lab",
    name: "Sistem Praktikum & Laboratorium",
    slug: "lab",
    targetUrl: "https://lab.ten.my.id",
    description:
      "Modul praktikum teknik, pelaporan tugas akhir lab, monitoring instrumen, dan asistensi praktikum digital.",
    category: "Lab & Praktikum",
    icon: "Cpu",
    isActive: true,
    sortOrder: 2,
    clicksCount: 28,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "app_materi",
    name: "Katalog Materi & Sumber Belajar",
    slug: "materi",
    targetUrl: "https://materi.ten.my.id",
    description:
      "Arsip silabus, slide presentasi, diktat kuliah teknik, dan referensi jurnal akademik terkurasi.",
    category: "Akademik",
    icon: "BookOpen",
    isActive: true,
    sortOrder: 3,
    clicksCount: 65,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "app_tugas",
    name: "Manajemen Tugas & Proyek Rekayasa",
    slug: "tugas",
    targetUrl: "https://tugas.ten.my.id",
    description:
      "Pelacak tugas mandiri & kelompok, milestone proyek rekayasa keteknikan, dan deadline submission.",
    category: "Tugas & Proyek",
    icon: "FolderKanban",
    isActive: true,
    sortOrder: 4,
    clicksCount: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "app_calc",
    name: "Engineering Utilities & Toolbox",
    slug: "tools",
    targetUrl: "https://tools.ten.my.id",
    description:
      "Koleksi kalkulator teknik, konversi unit satuan sains, generator rumus, dan helper automasi perkuliahan.",
    category: "Resource & Tools",
    icon: "Wrench",
    isActive: true,
    sortOrder: 5,
    clicksCount: 37,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to get Cloudflare KV binding if available
function getCloudflareKV(): any {
  if (typeof globalThis !== "undefined") {
    const globalAny = globalThis as any;
    if (globalAny.ST_KV) return globalAny.ST_KV;
    if (globalAny.env?.ST_KV) return globalAny.env.ST_KV;
    if (globalAny.__env__?.ST_KV) return globalAny.__env__.ST_KV;
    if (process.env.ST_KV && typeof (process.env.ST_KV as any).get === "function") {
      return process.env.ST_KV;
    }
  }
  return null;
}

// Local filesystem KV fallback for development
const LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_KV_FILE = path.join(LOCAL_DATA_DIR, "kv-store.json");

function readLocalKV(): Record<string, any> {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_KV_FILE)) {
      const initialStore: Record<string, any> = {
        "apps:list": INITIAL_APPS,
        "logs:recent": [],
      };
      for (const app of INITIAL_APPS) {
        initialStore[`app:slug:${app.slug.toLowerCase()}`] = app;
      }
      fs.writeFileSync(LOCAL_KV_FILE, JSON.stringify(initialStore, null, 2));
      return initialStore;
    }
    const data = fs.readFileSync(LOCAL_KV_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local KV store:", err);
    return { "apps:list": INITIAL_APPS, "logs:recent": [] };
  }
}

function writeLocalKV(store: Record<string, any>) {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_KV_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("Error writing local KV store:", err);
  }
}

// Unified KV operations
export const kv = {
  async get<T = any>(key: string): Promise<T | null> {
    const cloudflareKV = getCloudflareKV();
    if (cloudflareKV) {
      try {
        const val = await cloudflareKV.get(key, "json");
        return (val as T) ?? null;
      } catch (e) {
        console.error(`Cloudflare KV get error for ${key}:`, e);
      }
    }
    const store = readLocalKV();
    return (store[key] as T) ?? null;
  },

  async put(key: string, value: any): Promise<void> {
    const cloudflareKV = getCloudflareKV();
    if (cloudflareKV) {
      try {
        await cloudflareKV.put(key, JSON.stringify(value));
        return;
      } catch (e) {
        console.error(`Cloudflare KV put error for ${key}:`, e);
      }
    }
    const store = readLocalKV();
    store[key] = value;
    writeLocalKV(store);
  },

  async delete(key: string): Promise<void> {
    const cloudflareKV = getCloudflareKV();
    if (cloudflareKV) {
      try {
        await cloudflareKV.delete(key);
        return;
      } catch (e) {
        console.error(`Cloudflare KV delete error for ${key}:`, e);
      }
    }
    const store = readLocalKV();
    delete store[key];
    writeLocalKV(store);
  },
};

// High-level App and Log services
export async function getAllApps(): Promise<WebApp[]> {
  const apps = await kv.get<WebApp[]>("apps:list");
  if (!apps || !Array.isArray(apps) || apps.length === 0) {
    await kv.put("apps:list", INITIAL_APPS);
    for (const app of INITIAL_APPS) {
      await kv.put(`app:slug:${app.slug.toLowerCase()}`, app);
    }
    return INITIAL_APPS;
  }
  return apps.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAppBySlug(slug: string): Promise<WebApp | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  const directApp = await kv.get<WebApp>(`app:slug:${normalizedSlug}`);
  if (directApp) return directApp;

  const allApps = await getAllApps();
  const found = allApps.find((a) => a.slug.toLowerCase() === normalizedSlug);
  if (found) {
    await kv.put(`app:slug:${normalizedSlug}`, found);
    return found;
  }
  return null;
}

export async function saveApp(appData: Omit<WebApp, "id" | "clicksCount" | "createdAt" | "updatedAt"> & { id?: string }): Promise<WebApp> {
  const allApps = await getAllApps();
  const now = new Date().toISOString();

  if (appData.id) {
    const index = allApps.findIndex((a) => a.id === appData.id);
    if (index === -1) throw new Error("Aplikasi tidak ditemukan");

    const oldSlug = allApps[index].slug.toLowerCase();
    const updatedApp: WebApp = {
      ...allApps[index],
      name: appData.name,
      slug: appData.slug.toLowerCase().trim().replace(/^\/+/, ""),
      targetUrl: appData.targetUrl.trim(),
      description: appData.description,
      category: appData.category,
      icon: appData.icon || "ExternalLink",
      isActive: appData.isActive,
      sortOrder: Number(appData.sortOrder) || 0,
      updatedAt: now,
    };

    allApps[index] = updatedApp;
    await kv.put("apps:list", allApps);

    if (oldSlug !== updatedApp.slug) {
      await kv.delete(`app:slug:${oldSlug}`);
    }
    await kv.put(`app:slug:${updatedApp.slug}`, updatedApp);

    return updatedApp;
  } else {
    // Check slug uniqueness
    const slug = appData.slug.toLowerCase().trim().replace(/^\/+/, "");
    if (allApps.some((a) => a.slug.toLowerCase() === slug)) {
      throw new Error(`Path / slug "${slug}" sudah digunakan.`);
    }

    const newApp: WebApp = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: appData.name,
      slug,
      targetUrl: appData.targetUrl.trim(),
      description: appData.description,
      category: appData.category || "Umum",
      icon: appData.icon || "ExternalLink",
      isActive: appData.isActive ?? true,
      sortOrder: Number(appData.sortOrder) || allApps.length + 1,
      clicksCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    allApps.push(newApp);
    await kv.put("apps:list", allApps);
    await kv.put(`app:slug:${newApp.slug}`, newApp);

    return newApp;
  }
}

export async function deleteApp(id: string): Promise<boolean> {
  const allApps = await getAllApps();
  const appToDelete = allApps.find((a) => a.id === id);
  if (!appToDelete) return false;

  const filtered = allApps.filter((a) => a.id !== id);
  await kv.put("apps:list", filtered);
  await kv.delete(`app:slug:${appToDelete.slug.toLowerCase()}`);
  return true;
}

export async function toggleAppStatus(id: string, isActive: boolean): Promise<WebApp | null> {
  const allApps = await getAllApps();
  const index = allApps.findIndex((a) => a.id === id);
  if (index === -1) return null;

  allApps[index].isActive = isActive;
  allApps[index].updatedAt = new Date().toISOString();
  await kv.put("apps:list", allApps);
  await kv.put(`app:slug:${allApps[index].slug.toLowerCase()}`, allApps[index]);

  return allApps[index];
}

export async function recordAppClick(app: WebApp, logMeta: { ip: string; userAgent: string; referer: string }): Promise<void> {
  const now = new Date().toISOString();

  // Increment clicks in apps:list
  const allApps = await getAllApps();
  const index = allApps.findIndex((a) => a.id === app.id);
  if (index !== -1) {
    allApps[index].clicksCount = (allApps[index].clicksCount || 0) + 1;
    allApps[index].updatedAt = now;
    await kv.put("apps:list", allApps);
    await kv.put(`app:slug:${app.slug.toLowerCase()}`, allApps[index]);
  }

  // Record access log
  const newLog: AccessLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    appId: app.id,
    appName: app.name,
    slug: app.slug,
    targetUrl: app.targetUrl,
    timestamp: now,
    ip: logMeta.ip || "127.0.0.1",
    userAgent: logMeta.userAgent || "Unknown",
    referer: logMeta.referer || "Direct",
  };

  const recentLogs = (await kv.get<AccessLog[]>("logs:recent")) || [];
  recentLogs.unshift(newLog);
  // Keep last 300 logs
  if (recentLogs.length > 300) {
    recentLogs.length = 300;
  }
  await kv.put("logs:recent", recentLogs);
}

export async function getRecentLogs(): Promise<AccessLog[]> {
  const logs = await kv.get<AccessLog[]>("logs:recent");
  return logs || [];
}

export async function clearRecentLogs(): Promise<void> {
  await kv.put("logs:recent", []);
}

export async function getStatsSummary(): Promise<StatsSummary> {
  const allApps = await getAllApps();
  const recentLogs = await getRecentLogs();

  const totalApps = allApps.length;
  const activeApps = allApps.filter((a) => a.isActive).length;
  const totalClicks = allApps.reduce((acc, a) => acc + (a.clicksCount || 0), 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const clicksToday = recentLogs.filter((log) => {
    try {
      return new Date(log.timestamp) >= todayStart;
    } catch {
      return false;
    }
  }).length;

  const categoryDistribution: Record<string, number> = {};
  for (const app of allApps) {
    const cat = app.category || "Umum";
    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
  }

  return {
    totalApps,
    activeApps,
    totalClicks,
    clicksToday,
    categoryDistribution,
  };
}
