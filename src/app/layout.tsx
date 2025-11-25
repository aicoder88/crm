import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Purrify CRM - Award-Winning Customer Management",
  description: "Next-generation CRM for Purrify - Managing B2B pet store relationships across Canada with unmatched speed, beauty, and efficiency",
  manifest: "/manifest.json",
  themeColor: "#7832ff",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Purrify CRM",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Purrify CRM",
    "application-name": "Purrify CRM",
    "msapplication-TileColor": "#7832ff",
    "msapplication-tap-highlight": "no",
  },
};

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { TaskReminderMonitor } from "@/components/tasks/TaskReminderMonitor";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <SidebarProvider>
            <TaskReminderMonitor />
            <AppSidebar />
            <SidebarInset className="bg-transparent">
              <Header />
              <main className="flex-1 p-6 overflow-auto bg-transparent">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
            </SidebarInset>
            <KeyboardShortcutsDialog />
            <Toaster richColors position="top-right" />
          </SidebarProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
