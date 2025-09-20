"use client";

import { useEffect, useState } from "react";
import { seedDatabase } from "../lib/mock-data";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import InventoryPage from "./inventory";
import DashboardPage from "./dashboard";
import SuppliersPage from "./suppliers";
import SettingsPage from "./settings";
import WarehousePage from "./warehouse";
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "../components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Users,
  Warehouse,
  Settings,
  Menu,
  X,
  HomeIcon,
} from "lucide-react";
import { useResponsive } from "../hooks/use-mobile";
import { cn } from "../lib/utils";
import { ResponsiveErrorBoundary } from "../components/responsive-error-boundary";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "dashboard", component: DashboardPage },
  { name: "Inventory", icon: Package, path: "inventory", component: InventoryPage },
  { name: "Suppliers", icon: Users, path: "suppliers", component: SuppliersPage },
  { name: "Warehouse", icon: Warehouse, path: "warehouse", component: WarehousePage },
  { name: "Settings", icon: Settings, path: "settings", component: SettingsPage },
];

export default function InventoryApp() {
  const [activePage, setActivePage] = useState("dashboard");
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false); // This will be managed by SidebarProvider
  const { isMobile } = useResponsive(); // Use the new responsive hook
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  // Access sidebar context for controlling mobile sidebar
  // Note: This can only be called if InventoryApp is wrapped in SidebarProvider, which it is.
  // However, to use it here, we might need to lift SidebarProvider higher or pass toggle functions.
  // For now, let's adjust the SidebarProvider props first.

  // Seed database on initial load in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const hasSeeded = localStorage.getItem("dbSeeded");
      if (!hasSeeded) {
        handleSeedDatabase(false); // Call without showing toast initially, or make it conditional
      }
    }
  }, []);

  const handleSeedDatabase = async (showToastNotification = true) => {
    setIsSeeding(true);
    try {
      const result = await seedDatabase();
      if (result.success) {
        if (showToastNotification) {
          toast({
            title: "Database Seeded",
            description: "Mock data has been loaded into the database.",
          });
        }
        localStorage.setItem("dbSeeded", "true");
        // Optionally, refresh the current page or specific components if needed
        // For example, if on inventory page, trigger a re-fetch of products
        if (activePage === "inventory") {
          // This is a bit of a hack. A better way would be to use a global state or context
          // to trigger re-fetches in child components.
          window.location.reload(); // Simple reload for now
        }
      } else {
        if (showToastNotification) {
          toast({
            title: "Seeding Failed",
            description: result.message || "Could not seed database.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error during seeding process:", error);
      if (showToastNotification) {
        toast({
          title: "Seeding Error",
          description: "An unexpected error occurred during seeding.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const renderPage = () => {
    const item = navItems.find((item) => item.path === activePage);
    if (item && item.component) {
      const PageComponent = item.component;
      return <PageComponent />;
    }
    return <DashboardPage />; // Default to Dashboard
  };

  return (
    <ResponsiveErrorBoundary>
      <SidebarProvider defaultOpen={!isMobile}> {/** Control sidebar state here, defaultOpen can be set based on isMobile */}
        <InventoryAppContent /> {/** Moved original content to a new component */}
      </SidebarProvider>
    </ResponsiveErrorBoundary>
  );
}

// New component to access useSidebar hook correctly
function InventoryAppContent() {
  const [activePage, setActivePage] = useState("dashboard");
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { openMobile, setOpenMobile, state } = useSidebar();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const hasSeeded = localStorage.getItem("dbSeeded");
      if (!hasSeeded) {
        handleSeedDatabase(false);
      }
    }
  }, []);

  const handleSeedDatabase = async (showToastNotification = true) => {
    setIsSeeding(true);
    try {
      const result = await seedDatabase();
      if (result.success) {
        if (showToastNotification) {
          toast({
            title: "Database Seeded",
            description: "Mock data has been loaded into the database.",
          });
        }
        localStorage.setItem("dbSeeded", "true");
        if (activePage === "inventory") {
          window.location.reload();
        }
      } else {
        if (showToastNotification) {
          toast({
            title: "Seeding Failed",
            description: result.message || "Could not seed database.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error during seeding process:", error);
      if (showToastNotification) {
        toast({
          title: "Seeding Error",
          description: "An unexpected error occurred during seeding.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const renderPage = () => {
    const item = navItems.find((item) => item.path === activePage);
    if (item && item.component) {
      const PageComponent = item.component;
      return <PageComponent />;
    }
    return <DashboardPage />; // Default to Dashboard
  };

  const handleMobileNavItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const bottomNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
    { name: "Inventory", icon: Package, path: "inventory" },
    { name: "Warehouse", icon: Warehouse, path: "warehouse" }, // Added Warehouse to bottomNavItems
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden md:flex">
        <div className="p-3 md:p-4">
          <h1 className="text-lg md:text-2xl font-semibold truncate">Stock PWA</h1>
        </div>
        <nav className="flex-1 space-y-1 md:space-y-2 p-3 md:p-4">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  onClick={() => {
                    setActivePage(item.path);
                    handleMobileNavItemClick();
                  }}
                  isActive={activePage === item.path}
                  className="w-full justify-start text-sm md:text-base"
                  tooltip={item.name}
                >
                  <item.icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
        {process.env.NODE_ENV === "development" && (
          <div className="p-3 md:p-4 border-t">
            <Button
              onClick={() => handleSeedDatabase(true)}
              disabled={isSeeding}
              className="w-full text-xs md:text-sm"
              size={isMobile ? "sm" : "default"}
            >
              {isSeeding ? "Seeding..." : "Seed Mock Data"}
            </Button>
          </div>
        )}
      </Sidebar>

      <div className={cn("flex-1 flex flex-col min-w-0", isMobile && openMobile ? "blur-sm pointer-events-none" : "")}>
        {isMobile && (
          <header className="sticky top-0 z-40 flex h-12 md:h-14 items-center justify-between gap-2 md:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 md:px-4">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpenMobile(!openMobile)}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              {openMobile ? <X className="h-4 w-4 md:h-5 md:w-5" /> : <Menu className="h-4 w-4 md:h-5 md:w-5" />}
              <span className="sr-only">{openMobile ? "Close sidebar" : "Open sidebar"}</span>
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-lg md:text-xl font-semibold capitalize truncate">{activePage}</h2>
            </div>
            <div className="w-8 md:w-10" /> {/* Spacer for balance */}
          </header>
        )}

        <main className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6 lg:p-8 pb-20 md:pb-6">
          {renderPage()}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border z-50 md:hidden">
            <div className="flex justify-around items-center py-1 px-2 safe-area-pb">
              {bottomNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant={activePage === item.path ? "default" : "ghost"}
                  className={cn(
                    "flex flex-col items-center rounded-lg h-auto px-2 py-1.5 text-xs leading-none min-w-0 flex-1 max-w-[80px]",
                    activePage === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActivePage(item.path)}
                >
                  <item.icon className="h-4 w-4 mb-0.5 flex-shrink-0" />
                  <span className="truncate text-[10px]">{item.name}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="flex flex-col items-center rounded-lg h-auto px-2 py-1.5 text-xs leading-none text-muted-foreground hover:text-foreground min-w-0 flex-1 max-w-[80px]"
                onClick={() => setOpenMobile(true)}
              >
                <Menu className="h-4 w-4 mb-0.5 flex-shrink-0" />
                <span className="truncate text-[10px]">More</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
