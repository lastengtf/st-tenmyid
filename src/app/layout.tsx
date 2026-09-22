import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "st.ten.my.id — Portal Sarjana Teknik",
  description:
    "Pusat sarjana teknik dan portal terpadu direktori web dan aplikasi perkuliahan sarjana teknik.",
  keywords: [
    "sarjana teknik",
    "portal perkuliahan",
    "st.ten.my.id",
    "engineering hub",
    "ten",
  ],
  authors: [{ name: "TEN" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('st_theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        {children}
      </body>
    </html>
  );
}
