# st.ten.my.id — Platform Portal Sarjana Teknik

Platform portal pusat sarjana teknik dan direktori aplikasi akademik terintegrasi untuk ekosistem **st.ten.my.id**. Dibangun dengan arsitektur modern SaaS (Linear / Vercel style) menggunakan Next.js App Router, Tailwind CSS, TypeScript, dan Shadcn UI primitives, serta dirancang untuk deployment di Cloudflare dengan binding **Cloudflare KV (`ST_KV`)**.

---

## 🌟 Fitur Utama

1. **Halaman Depan Publik (`/`)**:
   - Tampilan portal terpusat bernuansa modern minimalis SaaS.
   - Bento-grid direktori Web & Apps perkuliahan sarjana teknik.
   - Pencarian cepat (instant search) dan filter kategori (Akademik, Jadwal, Lab & Praktikum, Tugas & Proyek, Resource & Tools).
   - Akses publik terisolasi — tidak terdapat tautan ke panel admin di navigasi publik.

2. **Direct Access Routing (`/:slug`)**:
   - Pengunjung dapat mengakses langsung subsistem via URL ringkas seperti `st.ten.my.id/jadkel`, `st.ten.my.id/lab`, dll.
   - Pencatatan otomatis log kunjungan (timestamp, user agent, IP pengunjung, referer) dan peningkatan akumulasi klik secara real-time.
   - Otomatis melakukan HTTP redirect (307) ke URL tujuan yang terdaftar.
   - Penanganan fallback 404 jika slug tidak aktif atau belum terdaftar.

3. **Panel Administrasi Terproteksi (`/admin`)**:
   - Otentikasi aman melalui `/login` dengan pengecekan variabel lingkungan Cloudflare (`ADMIN_EMAIL` & `ADMIN_PASSWORD`), bukan hardcode.
   - Proteksi sesi berbasis encrypted JWT HTTP-only cookie.
   - **Menu Statistik**: Metrik total apps, apps aktif, total redirect hits, kunjungan hari ini, grafik ranking performa klik, dan komposisi kategori.
   - **Menu Web / Apps**: CRUD lengkap (Tambah, Edit, Hapus) dan toggle instan Aktif / Nonaktif aplikasi.
   - **Menu Log Pengunjung**: Riwayat audit jejak akses direct route secara rinci dengan fitur filter dan pembersihan log.

---

## 🚀 Menjalankan Secara Lokal

1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi Lingkungan (`.env.local`)**:
   ```env
   ADMIN_EMAIL=admin@st.ten.my.id
   ADMIN_PASSWORD=adminst12345!
   AUTH_SECRET=rahasia_st_ten_my_id_super_secure_key_32chars!
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser.

---

## ☁️ Konfigurasi Cloudflare & Deployment

Platform ini siap dideploy ke Cloudflare menggunakan **Wrangler** dan **OpenNext**:

1. **Buat Namespace KV di Cloudflare**:
   ```bash
   npx wrangler kv namespace create ST_KV
   ```
   Salin ID namespace yang dihasilkan dan masukkan ke dalam file `wrangler.jsonc`:
   ```json
   "kv_namespaces": [
     {
       "binding": "ST_KV",
       "id": "<ID_NAMESPACE_KV_ANDA>"
     }
   ]
   ```

2. **Atur Secret Admin di Cloudflare**:
   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put AUTH_SECRET
   ```

3. **Build & Deploy ke Cloudflare**:
   ```bash
   npm run deploy:cloudflare
   ```

---

## 📁 Struktur Repositori

```
st-ten-my-id/
├── src/
│   ├── app/
│   │   ├── [slug]/          # Dynamic direct route handler & 404
│   │   ├── admin/           # Dashboard manajemen & analytics
│   │   ├── api/             # API routes (Auth, Apps CRUD, Logs, Stats)
│   │   ├── login/           # Halaman login admin
│   │   ├── globals.css      # Shadcn theme tokens
│   │   ├── layout.tsx       # Root layout & SEO metadata
│   │   └── page.tsx         # Portal beranda publik
│   ├── components/
│   │   ├── admin/           # Komponen dashboard admin
│   │   ├── portal/          # Komponen portal beranda & icon helper
│   │   └── ui/              # Shadcn UI primitives
│   ├── lib/
│   │   ├── auth.ts          # Otentikasi & session JWT
│   │   ├── kv.ts            # Abstraksi ST_KV Cloudflare & fallback lokal
│   │   └── utils.ts         # Utility styling cn()
│   └── middleware.ts        # Proteksi rute /admin
├── wrangler.jsonc           # Konfigurasi Cloudflare Wrangler (ST_KV binding)
├── components.json          # Shadcn UI config
├── tailwind.config.ts       # Tailwind CSS design tokens
├── package.json
└── README.md
```
