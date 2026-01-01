import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pocket Finance | Finanzas Personales",
  description: "Bilingual personal finance manager. Controla tus gastos e ingresos.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finance v2",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { FinanceProvider } from "@/context/finance-context";
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSync } from "@/components/theme-sync";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FinanceProvider>
            <ThemeSync />
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                {children}
              </main>
              <SiteFooter />
              <div className="fixed top-0 left-0 p-1 opacity-20 pointer-events-none text-[8px] z-[9999]">
                v2.1-final
              </div>
            </div>
          </FinanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
