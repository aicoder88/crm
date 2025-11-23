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
};

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { TaskReminderMonitor } from "@/components/tasks/TaskReminderMonitor";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { Toaster } from "@/components/ui/sonner";

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
        <SidebarProvider>
          <TaskReminderMonitor />
          <AppSidebar />
          <SidebarInset>
            <Header />
            <main className="flex-1 p-6 overflow-auto">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
          </SidebarInset>
          <KeyboardShortcutsDialog />
          <Toaster richColors position="top-right" />
        </SidebarProvider>
      </body>
    </html>
  );
}
