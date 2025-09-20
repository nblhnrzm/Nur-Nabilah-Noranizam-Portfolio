import type React from "react"
import './globals.css'
import { ThemeProvider } from  "@/components/theme-provider";
import { I18nProvider } from "@/i18n/i18n-provider";
import { translations } from "@/i18n/translations";
import { Toaster } from "@/components/ui/sonner";
import ClientLayoutWrapper from "@/components/client-layout-wrapper";

export const metadata = {
  title: "Stock Management PWA",
  description: "Efficiently manage your inventory with this Progressive Web App.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  )
}
