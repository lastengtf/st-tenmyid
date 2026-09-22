tugasmu membuat sebuah platform st.ten.my.id


platform ini akan menjadi pusat sarjana teknikku. dan platform ini sebagai portal dari web/apps terkait perkuliahanku.

nah pada platform ini akan menjadi root utama st.ten.my.id dan /:webatauapps

jadi di st.my.id akan tampil halaman depan yang juga akan memuat daftar web/app yang berkaitan dengan tema kehidupanku ini terkait perkuliahan sarjana teknikku ini.

jadi ada halaman depan, halaman login, halaman admin.


publik hanya melihat halaman depan, dan tidak ada akses ke halaman login mapupun admin, jadi hanya melalui path /login atau /admin jadi perlu mengetikkan manual di url. dan halaman admin hanya bisa di akses jika sudah lolos verifikasi di halaman login. untuk email dan password admin akan menggunakan variabel dari cloudflare supaya aman jadi bukan di hardcode.

jadi publik yang mengunungi st.ten.my.id akan diarahkan ke halaman depannya.


kemudian pada halaman admin. admin bisa menambah, mengedit, menghapus, mengaktifkan, menonaktifkan web/apps yang ada di platform st.ten.my.id. jadi sistem web/apps yang ada di atur di halaman admin hanyalan semacam direct dari web lain punyaku jadi aku hanya mendaftarkannya ke st.ten.my.id supaya bisa muncul di halaman depan st.ten.my.id dan bisa di akses oleh publik melalui st.ten.my.id. dengan pathnya yang sudah diatur. dan di halaman admin bisa melihat statistiknya. jadi menu di admin adalah statistik, web/apps, dan log user/pengunjung.


kita akan menggunakan nextjs atau terserah saja dan kita akan menggungakan wrangkler, dan kode akan di push ke github dan akan di deploy ke cloudflare.

https://github.com/lastengtf/st-tenmyid

jadi proyek dikerjakan di folder ini saja. karena akan ada anak-anak projeck nanti kedepannya dalam folder ini, jadi jangan di libatkan.



Role: Senior Frontend Engineer & UI/UX Specialist.

Konteks Proyek:
Proyek ini dibangun di atas Shadcn UI Starter Kit (Next.js App Router, Tailwind CSS, TypeScript, dan Radix UI Primitives).

Aturan Wajib (UI/UX & Kode):

1. Strict Component Reuse
- WAJIB gunakan komponen yang sudah ada di `@/components/ui/*` (Button, Card, Input, Table, Dialog, Badge, Tabs, dll.).
- DILARANG membuat elemen interaktif manual menggunakan tag `div` mentah atau `button` HTML biasa tanpa styling primitives.
- Ikon hanya boleh menggunakan `lucide-react`.

2. Desain Token & Warna (No Custom/Hex Color)
- Gunakan token tema bawaan Shadcn UI secara konsisten:
  - Background & Teks: `bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`.
  - Muted/Sekunder: `text-muted-foreground`, `bg-muted`.
  - Border: `border-border` (utamakan border 1px daripada drop-shadow tebal).
  - Aksen: `bg-primary`, `text-primary-foreground`.
- DILARANG menggunakan warna heksadesimal acak (misal: `#6366f1`) atau class gradasi neon generik (seperti `bg-gradient-to-r from-purple-500 to-indigo-500`).

3. Layout & Spacing System
- Terapkan layout bergaya modern SaaS (kiblat: Linear / Vercel): minimalis, padat informasi, rapi, dan mudah di-scan.
- Gunakan sistem spacing standar kelipatan 4 (`gap-2`, `gap-4`, `p-4`, `p-6`). Dilarang memakai arbitrary margin/padding seperti `p-[15px]`.
- Susun hierarki layout menggunakan Bento-grid atau modular card (`CardHeader`, `CardContent`, `CardFooter`).
- Radius sudut harus seragam mengikuti token sistem (`rounded-lg` atau `rounded-md`). Dilarang membuat kontainer atau kartu berbentuk kapsul (`rounded-full`).

4. Status & Responsivitas
- Setiap elemen interaktif wajib memiliki state visual yang halus:
  - Hover: `hover:bg-accent hover:text-accent-foreground`
  - Focus: ring standar bawaan Shadcn (`focus-visible:ring-1`)
  - Disabled: `disabled:opacity-50 disabled:pointer-events-none`
- Transisi halus dan cepat (`transition-colors duration-150`), jangan gunakan animasi masuk yang memantul atau berlebihan.
- Mobile-first: pastikan tampilan grid otomatis menjadi 1 kolom di layar HP (`grid-cols-1 md:grid-cols-3` atau `grid-cols-1 lg:grid-cols-4`).

Output yang Diharapkan:
Setiap kode komponen yang kamu buat harus langsung berupa production-grade TypeScript React (`.tsx`), memanfaatkan utility `cn()` dari `@/lib/utils`, dan mematuhi seluruh batasan visual di atas.