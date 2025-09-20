"use client"

import React,{ useState, useEffect } from "react"
import { useAuth } from "../hooks/use-auth" // Add this import
import ProtectedRoute from "../components/protected-route"
import { useRouter } from "next/navigation"
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clipboard,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Settings,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Boxes,
  BarChart2,
  PieChartIcon,
  Activity,
  LogOut, // Import LogOut icon
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart"
import { Button } from "../components/ui/button"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Checkbox } from "../components/ui/checkbox"
import { Label } from "../components/ui/label"
import { cn } from "../lib/utils"
import { useResponsive } from "../hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Progress } from "../components/ui/progress"


// Sample sales data
const salesData = [
  { month: "Jan", sales: 4000, purchases: 2400 },
  { month: "Feb", sales: 3000, purchases: 1398 },
  { month: "Mar", sales: 2000, purchases: 9800 },
  { month: "Apr", sales: 2780, purchases: 3908 },
  { month: "May", sales: 1890, purchases: 4800 },
  { month: "Jun", sales: 2390, purchases: 3800 },
]

// Sample sales trend data
const salesTrendData = [
  { date: "2023-01", value: 4000 },
  { date: "2023-02", value: 3000 },
  { date: "2023-03", value: 5000 },
  { date: "2023-04", value: 4500 },
  { date: "2023-05", value: 6000 },
  { date: "2023-06", value: 5500 },
  { date: "2023-07", value: 7000 },
  { date: "2023-08", value: 6500 },
  { date: "2023-09", value: 8000 },
  { date: "2023-10", value: 7500 },
  { date: "2023-11", value: 9000 },
  { date: "2023-12", value: 9500 },
]

// Sample category distribution data
const categoryData = [
  { name: "Electronics", value: 45 },
  { name: "Accessories", value: 25 },
  { name: "Computer Peripherals", value: 20 },
  { name: "Other", value: 10 },
]

// Sample top products data
const topProductsData = [
  { name: "Wireless Headphones", value: 120 },
  { name: "USB-C Cable", value: 98 },
  { name: "Smartphone Case", value: 86 },
  { name: "Bluetooth Speaker", value: 72 },
  { name: "Wireless Mouse", value: 65 },
]

// Sample inventory health data
const inventoryHealthData = [
  { name: "Optimal", value: 65 },
  { name: "Low Stock", value: 25 },
  { name: "Out of Stock", value: 10 },
]

// Sample low stock items
const lowStockItems = [
  { id: 1, name: "Wireless Headphones", sku: "WH-001", stock: 5, threshold: 10 },
  { id: 2, name: "USB-C Cable", sku: "USB-C-002", stock: 3, threshold: 15 },
  { id: 3, name: "Smartphone Case", sku: "SC-003", stock: 2, threshold: 8 },
]

// Sample customer segments data
const customerSegmentsData = [
  { name: "Retail", value: 45 },
  { name: "Wholesale", value: 30 },
  { name: "Online", value: 25 },
]

// Sample inventory turnover data
const inventoryTurnoverData = [
  { month: "Jan", turnover: 2.1 },
  { month: "Feb", turnover: 2.3 },
  { month: "Mar", turnover: 2.5 },
  { month: "Apr", turnover: 2.2 },
  { month: "May", turnover: 2.6 },
  { month: "Jun", turnover: 2.8 },
]

// Sample customer acquisition data
const customerAcquisitionData = [
  { month: "Jan", new: 45, returning: 120 },
  { month: "Feb", new: 52, returning: 115 },
  { month: "Mar", new: 48, returning: 130 },
  { month: "Apr", new: 61, returning: 125 },
  { month: "May", new: 55, returning: 140 },
  { month: "Jun", new: 67, returning: 135 },
]

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

// Available quick actions
const allQuickActions = [
  { id: "add-product", label: "Add Product", icon: Plus, color: "bg-green-100 text-green-700" },
  { id: "create-order", label: "Create Order", icon: ShoppingCart, color: "bg-blue-100 text-blue-700" },
  { id: "create-purchase", label: "Purchase Order", icon: Truck, color: "bg-purple-100 text-purple-700" },
  { id: "inventory-count", label: "Inventory Count", icon: Clipboard, color: "bg-amber-100 text-amber-700" },
  { id: "generate-report", label: "Generate Report", icon: FileText, color: "bg-indigo-100 text-indigo-700" },
  { id: "print-labels", label: "Print Labels", icon: Printer, color: "bg-gray-100 text-gray-700" },
  { id: "process-payment", label: "Process Payment", icon: CreditCard, color: "bg-red-100 text-red-700" },
  { id: "refresh-data", label: "Refresh Data", icon: RefreshCw, color: "bg-cyan-100 text-cyan-700" },
]

// Mini sparkline component
const MiniSparkline = ({ data, color = "#0088FE" }: { data: number[]; color?: string }) => {
  const chartData = data.map((value: number, index: number) => ({ index, value }))

  return (
    <ResponsiveContainer width="100%" height={30}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function DashboardPage() {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const { logout } = useAuth() // Add this to access the logout function
  const router = useRouter() // Get router instance
  
  // Default selected quick actions (responsive based on screen size)
  const defaultActions = isMobile
    ? ["add-product", "create-order", "create-purchase"]
    : isTablet
    ? ["add-product", "create-order", "create-purchase", "inventory-count"]
    : ["add-product", "create-order", "create-purchase", "inventory-count"]

  const [selectedActions, setSelectedActions] = useState(defaultActions)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [tempSelectedActions, setTempSelectedActions] = useState(selectedActions)
  const [activeTab, setActiveTab] = useState("overview")

  // Get visible actions based on selected IDs
  const visibleActions = allQuickActions.filter((action) => selectedActions.includes(action.id))

  const handleActionToggle = (actionId: string) => {
    setTempSelectedActions((prev) => {
      if (prev.includes(actionId)) {
        return prev.filter((id) => id !== actionId)
      } else {
        return [...prev, actionId]
      }
    })
  }

  const saveCustomization = () => {
    setSelectedActions(tempSelectedActions)
    setIsCustomizing(false)
  }

  const cancelCustomization = () => {
    setTempSelectedActions(selectedActions)
    setIsCustomizing(false)
  }

  // Sample sparkline data
  const salesSparkline = [4, 6, 8, 5, 9, 7, 11, 10, 13, 12, 14]
  const ordersSparkline = [8, 5, 7, 9, 6, 8, 10, 9, 12, 10, 11]
  const stockSparkline = [15, 13, 14, 12, 10, 11, 9, 8, 7, 6, 5]
  const revenueSparkline = [10, 12, 15, 14, 16, 18, 17, 19, 21, 20, 22]

  // Handle sign out
  const handleSignOut = async () => {
    await logout();
    router.push("/sign-in"); // Redirect to sign-in page after logout
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-black overflow-x-hidden overflow-y-auto">        
        <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Quick Actions */}
        <Card className="shadow-sm bg-black border-gray-800 w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6">
            <CardTitle className="text-base font-medium text-white">Quick Actions</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="default"
                onClick={() => {
                  setTempSelectedActions(selectedActions)
                  setIsCustomizing(true)
                }}
                className="h-10 w-10 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Customize</span>
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={handleSignOut}
                className="h-10 w-10 text-gray-300 hover:text-red-400 hover:bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 w-full">
              <TooltipProvider>
                {visibleActions.map((action) => (
                  <UITooltip key={action.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col h-auto py-3 px-3 border touch-target text-sm",
                          action.color
                        )}
                      >
                        <action.icon className="mb-1 flex-shrink-0 h-5 w-5" />
                        <span className="font-medium text-center leading-tight text-xs">
                          {action.label}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </UITooltip>
                ))}
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Customize Quick Actions Dialog */}
        <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customize Quick Actions</DialogTitle>
              <DialogDescription>Select the actions you want to display on your dashboard.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {allQuickActions.map((action) => (
                <div key={action.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={action.id}
                    checked={tempSelectedActions.includes(action.id)}
                    onCheckedChange={() => handleActionToggle(action.id)}
                  />
                  <Label htmlFor={action.id} className="flex items-center cursor-pointer">
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Label>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={cancelCustomization}>
                Cancel
              </Button>
              <Button onClick={saveCustomization}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Card className="shadow-sm bg-black border-gray-800 min-w-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-400 text-xs">
                    Products
                  </p>
                  <h4 className="font-bold text-white text-xl lg:text-2xl">
                    1,284
                  </h4>
                </div>
                <div className="rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 h-8 w-8">
                  <Package className="text-primary h-4 w-4" />
                </div>
              </div>
              <div className="mt-1">
                <MiniSparkline data={salesSparkline} color="#2563eb" />
              </div>
              <div className="flex items-center pt-1 text-green-400 text-xs">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-black border-gray-800 min-w-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-400 text-xs">
                    Revenue
                  </p>
                  <h4 className="font-bold text-white text-xl lg:text-2xl">
                    $24,780
                  </h4>
                </div>
                <div className="rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 h-8 w-8">
                  <DollarSign className="text-green-600 h-4 w-4" />
                </div>
              </div>
              <div className="mt-1">
                <MiniSparkline data={revenueSparkline} color="#16a34a" />
              </div>
              <div className="flex items-center pt-1 text-green-400 text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span>8.2% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-black border-gray-800 min-w-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-400 text-xs">
                    Orders
                  </p>
                  <h4 className="font-bold text-white text-xl lg:text-2xl">
                    342
                  </h4>
                </div>
                <div className="rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 h-8 w-8">
                  <ShoppingCart className="text-blue-600 h-4 w-4" />
                </div>
              </div>
              <div className="mt-1">
                <MiniSparkline data={ordersSparkline} color="#2563eb" />
              </div>
              <div className="flex items-center pt-1 text-red-400 text-xs">
                <ArrowDown className="mr-1 h-3 w-3" />
                <span>3.1% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-black border-gray-800 min-w-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-400 text-xs">
                    Low Stock
                  </p>
                  <h4 className="font-bold text-white text-xl lg:text-2xl">
                    12
                  </h4>
                </div>
                <div className="rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 h-8 w-8">
                  <AlertTriangle className="text-amber-600 h-4 w-4" />
                </div>
              </div>
              <div className="mt-1">
                <MiniSparkline data={stockSparkline} color="#d97706" />
              </div>
              <div className="flex items-center pt-1 text-red-400 text-xs">
                <TrendingDown className="mr-1 h-3 w-3" />
                <span>Requires attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="overview" className="text-xs flex-1 md:flex-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="sales" className="text-xs flex-1 md:flex-none">
                Sales
              </TabsTrigger>
              <TabsTrigger value="inventory" className="text-xs flex-1 md:flex-none">
                Inventory
              </TabsTrigger>
              <TabsTrigger value="customers" className="text-xs flex-1 md:flex-none">
                Customers
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Last 30 days
              </Badge>
            </div>
          </div>

          <TabsContent value="overview" className="w-full space-y-4">
            {/* Sales Trend Chart */}
            <Card className="w-full shadow-sm bg-black border-gray-800 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Sales Trend</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Revenue",
                      color: "#2563eb",
                    },
                  }}
                  className="h-[200px] w-full"
                >
                  <LineChart data={salesTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Analytics Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Category Distribution */}
              <Card className="w-full shadow-sm bg-black border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-white">Category Distribution</CardTitle>
                    <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Percentage",
                        color: "#8884d8",
                      },
                    }}
                    className="h-[250px] w-full"
                  >
                    <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = ((data.value / total) * 100).toFixed(1);
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Category
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      {data.name}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Count
                                    </span>
                                    <span className="font-bold">
                                      {data.value}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Percentage
                                    </span>
                                    <span className="font-bold">
                                      {percentage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="w-full shadow-sm bg-black border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-white">Top Products</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Sales",
                        color: "#8884d8",
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <BarChart
                      data={topProductsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                        {topProductsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Health and Low Stock */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Inventory Health */}
              <Card className="w-full shadow-sm bg-black border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-white">Inventory Health</CardTitle>
                    <Boxes className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inventoryHealthData.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white">{item.name}</span>
                          <span className="font-medium text-white">{item.value}%</span>
                        </div>
                        <Progress
                          value={item.value}
                          className={cn(
                            "h-2",
                            index === 0 && "bg-green-100 [&>div]:bg-green-500",
                            index === 1 && "bg-amber-100 [&>div]:bg-amber-500",
                            index === 2 && "bg-red-100 [&>div]:bg-red-500",
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Items */}
              <Card className="w-full shadow-sm bg-black border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-white">Low Stock Items</CardTitle>
                    <Badge variant="destructive">Attention Required</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border border-gray-700 rounded-lg">
                        <div>
                          <h3 className="text-sm font-medium text-white">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{item.stock} in stock</p>
                            <p className="text-xs text-muted-foreground">Threshold: {item.threshold}</p>
                          </div>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Low Stock
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="w-full space-y-4">
            <Card className="w-full shadow-sm bg-black border-gray-800 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">Sales vs Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sales: {
                      label: "Sales",
                      color: "hsl(var(--chart-1))",
                    },
                    purchases: {
                      label: "Purchases",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart accessibilityLayer data={salesData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                    <Bar dataKey="purchases" fill="var(--color-purchases)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Additional sales analytics would go here */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="w-full shadow-sm bg-black border-gray-800 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Activity className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold text-white">$8,942</h3>
                    <p className="text-sm text-muted-foreground">Average Order Value</p>
                    <Badge variant="outline" className="mt-2">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5.2%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full shadow-sm bg-black border-gray-800 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Users className="h-8 w-8 text-blue-500 mb-2" />
                    <h3 className="text-xl font-bold text-white">68%</h3>
                    <p className="text-sm text-muted-foreground">Repeat Customer Rate</p>
                    <Badge variant="outline" className="mt-2">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +2.4%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional row for third card */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="w-full shadow-sm bg-black border-gray-800 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <ShoppingCart className="h-8 w-8 text-green-500 mb-2" />
                    <h3 className="text-xl font-bold text-white">24.8%</h3>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <Badge variant="outline" className="mt-2">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -1.1%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Empty card to maintain grid layout */}
              <div></div>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="w-full space-y-4">
            {/* Inventory analytics would go here */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="w-full shadow-sm bg-black border-gray-800 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">Stock Levels by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">Electronics</span>
                        <span className="font-medium text-white">78%</span>
                      </div>
                      <Progress value={78} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">Accessories</span>
                        <span className="font-medium text-white">45%</span>
                      </div>
                      <Progress value={45} className="h-2 bg-purple-100 [&>div]:bg-purple-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">Computer Peripherals</span>
                        <span className="font-medium text-white">92%</span>
                      </div>
                      <Progress value={92} className="h-2 bg-green-100 [&>div]:bg-green-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">Smartphones</span>
                        <span className="font-medium text-white">34%</span>
                      </div>
                      <Progress value={34} className="h-2 bg-amber-100 [&>div]:bg-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">Cables</span>
                        <span className="font-medium text-white">23%</span>
                      </div>
                      <Progress value={23} className="h-2 bg-red-100 [&>div]:bg-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full shadow-sm bg-black border-gray-800 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">Inventory Turnover</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      turnover: {
                        label: "Turnover Rate",
                        color: "#8884d8",
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <LineChart
                      data={inventoryTurnoverData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="turnover"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="w-full space-y-4">
            {/* Customer analytics would go here */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="w-full shadow-sm bg-black border-gray-800 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">Customer Acquisition</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      new: {
                        label: "New Customers",
                        color: "#8884d8",
                      },
                      returning: {
                        label: "Returning Customers",
                        color: "#82ca9d",
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <BarChart
                      data={customerAcquisitionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="new" name="New Customers" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="returning" name="Returning Customers" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="w-full shadow-sm bg-black border-gray-800 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">Customer Segments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Percentage",
                        color: "#8884d8",
                      },
                    }}
                    className="h-[250px] w-full"
                  >
                    <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <Pie
                        data={customerSegmentsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {customerSegmentsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const total = customerSegmentsData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = ((data.value / total) * 100).toFixed(1);
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Segment
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      {data.name}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Count
                                    </span>
                                    <span className="font-bold">
                                      {data.value}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Percentage
                                    </span>
                                    <span className="font-bold">
                                      {percentage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
