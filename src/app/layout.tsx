import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import React, { Suspense } from "react";
import AuthComp from "@/components/auth/AuthComp";

export const metadata: Metadata = {
  title: "[AW - GGP] - Good Gate Pass",
  description: "AW-GGP",
  keywords: ["Next.js", "React", "Web App", "Premium Design", "Vanilla CSS"],
  authors: [{ name: "Vu Huynh" }],
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`,
  },
  openGraph: {
    title: "[AW - GGP] - Good Gate Pass",
    description: "AW-GGP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Toaster position="top-right" richColors closeButton />
          <LanguageProvider>
            <AuthProvider>
              <AuthComp />
              <div className="app-layout">
                <div className="main-content">
                  <Suspense fallback={null}>
                    <Header />
                  </Suspense>
                  <main className="page-content">
                    {children}
                  </main>
                </div>
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
