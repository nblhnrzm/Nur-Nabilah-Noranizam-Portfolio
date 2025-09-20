"use client"

import React, { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { I18nProvider } from "@/i18n/i18n-provider"
import { translations } from "@/i18n/translations"
import { defaultLocale } from "@/i18n/config"
import { FloatingActionButton } from "@/components/floating-action-button"
import { db, Product, Zone, Warehouse } from "@/lib/db" // Import db and types
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/hooks/use-auth"

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  // Pages where floating button should be hidden
  const hideFloatingButtonPages = ['/sign-in', '/sign-up']
  const shouldHideFloatingButton = hideFloatingButtonPages.includes(pathname)

  const fetchData = useCallback(async () => {
    try {
      const [productsData, zonesData, warehousesData] = await Promise.all([
        db.products.toArray(),
        db.zones.toArray(),
        db.warehouses.toArray(),
      ])
      setProducts(productsData)
      setZones(zonesData)
      setWarehouses(warehousesData)
      console.log("Fetched data:", { productsData, zonesData, warehousesData })
    } catch (error) {
      console.error("Error fetching data for FAB:", error)
      // Optionally, set an error state or show a toast
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchData() // Fetch initial data
  }, [fetchData])

  const handleStockOperationComplete = () => {
    console.log("Stock operation complete, refetching data...")
    fetchData() // Refetch data after a stock operation
  }

  if (!mounted) {
    // Return a placeholder or loading state
    return <div className="min-h-screen bg-gray-50"></div>
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider initialLocale={defaultLocale} translations={translations}>
        <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 w-full">{children}</main>
          {!shouldHideFloatingButton && (
            <FloatingActionButton
              products={products}
              zones={zones}
              warehouses={warehouses}
              onStockOperationComplete={handleStockOperationComplete}
            />
          )}
          <Toaster />
        </div>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}