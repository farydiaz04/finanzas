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
    title: "Finance",
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
            {children}
            <SiteFooter />
          </FinanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
