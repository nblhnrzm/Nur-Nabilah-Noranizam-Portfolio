"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Star,
  Truck,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useResponsive } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { ResponsiveContainer as RContainer } from "@/components/responsive-container"

// Sample suppliers data
const suppliersData = [
  {
    id: 1,
    name: "Global Electronics Supply Co.",
    contactName: "John Smith",
    email: "john@globalsupply.com",
    phone: "+1 (555) 123-4567",
    address: "123 Supply St, New York, NY 10001",
    category: "Electronics",
    rating: 4.8,
    status: "Active",
    leadTime: 3,
    reliability: 95,
  },
  {
    id: 2,
    name: "Tech Components Inc.",
    contactName: "Sarah Johnson",
    email: "sarah@techcomponents.com",
    phone: "+1 (555) 234-5678",
    address: "456 Tech Ave, San Francisco, CA 94107",
    category: "Electronics",
    rating: 4.5,
    status: "Active",
    leadTime: 5,
    reliability: 90,
  },
  {
    id: 3,
    name: "Office Supplies Direct",
    contactName: "Michael Brown",
    email: "michael@officesupplies.com",
    phone: "+1 (555) 345-6789",
    address: "789 Office Blvd, Chicago, IL 60601",
    category: "Office Supplies",
    rating: 4.2,
    status: "Active",
    leadTime: 2,
    reliability: 98,
  },
  {
    id: 4,
    name: "Premium Packaging Solutions",
    contactName: "Emily Davis",
    email: "emily@premiumpackaging.com",
    phone: "+1 (555) 456-7890",
    address: "101 Package Rd, Austin, TX 78701",
    category: "Packaging",
    rating: 4.0,
    status: "Active",
    leadTime: 4,
    reliability: 85,
  },
  {
    id: 5,
    name: "Industrial Parts & Equipment",
    contactName: "David Wilson",
    email: "david@industrialparts.com",
    phone: "+1 (555) 567-8901",
    address: "202 Industrial Way, Detroit, MI 48201",
    category: "Industrial",
    rating: 4.7,
    status: "Active",
    leadTime: 7,
    reliability: 92,
  },
  {
    id: 6,
    name: "Eco-Friendly Materials Co.",
    contactName: "Lisa Martinez",
    email: "lisa@ecofriendly.com",
    phone: "+1 (555) 678-9012",
    address: "303 Green St, Portland, OR 97201",
    category: "Materials",
    rating: 4.6,
    status: "Active",
    leadTime: 6,
    reliability: 88,
  },
  {
    id: 7,
    name: "Budget Office Supplies",
    contactName: "Robert Taylor",
    email: "robert@budgetoffice.com",
    phone: "+1 (555) 789-0123",
    address: "404 Budget Ln, Phoenix, AZ 85001",
    category: "Office Supplies",
    rating: 3.8,
    status: "Inactive",
    leadTime: 5,
    reliability: 75,
  },
  {
    id: 8,
    name: "Premium Electronics Ltd.",
    contactName: "Jennifer Anderson",
    email: "jennifer@premiumelectronics.com",
    phone: "+1 (555) 890-1234",
    address: "505 Premium Dr, Seattle, WA 98101",
    category: "Electronics",
    rating: 4.9,
    status: "Active",
    leadTime: 4,
    reliability: 97,
  },
]

export default function SuppliersPage() {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Filter suppliers based on search query, category filter, and status filter
  const filteredSuppliers = suppliersData.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "" || supplier.category === categoryFilter
    const matchesStatus = statusFilter === "" || supplier.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories for filter
  const categories = [...new Set(suppliersData.map((supplier) => supplier.category))]

  // Get unique statuses for filter
  const statuses = [...new Set(suppliersData.map((supplier) => supplier.status))]

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Active":
        return "success"
      case "Inactive":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="h-4 w-4 text-yellow-400"
          style={{ clipPath: "inset(0 50% 0 0)", fill: "currentColor" }}
        />,
      )
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return <div className="flex">{stars}</div>
  }

  return (
    <RContainer fullWidth padding="md">
      {/* Enhanced responsive header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <h1 className={cn(
          "font-bold tracking-tight",
          isMobile ? "text-xl" : "text-2xl md:text-3xl"
        )}>
          Suppliers Management
        </h1>
        <Button
          size={isMobile ? "default" : "lg"}
          className="w-full sm:w-auto touch-target"
        >
          <Plus className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
          <span className={isMobile ? "text-sm" : undefined}>
            Add New Supplier
          </span>
        </Button>
      </div>

      {/* Enhanced responsive stats cards */}
      <div className={cn(
        "grid gap-3 md:gap-4",
        isMobile
          ? "grid-cols-2"
          : isTablet
          ? "grid-cols-2 lg:grid-cols-4"
          : "grid-cols-4"
      )}>
        <Card>
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0",
            isMobile ? "p-2 pb-1" : "p-3 pb-1 md:pb-2"
          )}>
            <CardTitle className={cn(
              "font-medium",
              isMobile ? "text-[10px]" : "text-xs md:text-sm"
            )}>
              Total Suppliers
            </CardTitle>
            <Building className={cn(
              "text-muted-foreground",
              isMobile ? "h-3 w-3" : "h-4 w-4"
            )} />
          </CardHeader>
          <CardContent className={cn(
            "pt-0",
            isMobile ? "p-2" : "p-3 md:p-4 md:pt-0"
          )}>
            <div className={cn(
              "font-bold",
              isMobile ? "text-lg" : "text-xl md:text-2xl"
            )}>
              {suppliersData.length}
            </div>
            <div className={cn(
              "text-muted-foreground",
              isMobile ? "text-[10px]" : "text-xs"
            )}>
              Registered suppliers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Badge variant="success">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliersData.filter((supplier) => supplier.status === "Active").length}
            </div>
            <div className="text-xs text-muted-foreground">Currently active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Lead Time</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(suppliersData.reduce((acc, supplier) => acc + supplier.leadTime, 0) / suppliersData.length)}{" "}
              days
            </div>
            <div className="text-xs text-muted-foreground">Average delivery time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Reliability</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                suppliersData.reduce((acc, supplier) => acc + supplier.reliability, 0) / suppliersData.length,
              )}
              %
            </div>
            <div className="text-xs text-muted-foreground">On-time delivery rate</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className={cn(isMobile ? "p-3" : "p-4 md:p-6")}>
          <CardTitle className={cn(
            isMobile ? "text-base" : "text-lg md:text-xl"
          )}>
            Supplier List
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "p-3" : "p-4 md:p-6")}>
          <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="relative flex-1">
              <Search className={cn(
                "absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
              <Input
                type="search"
                placeholder="Search suppliers..."
                className={cn(
                  isMobile ? "pl-8 text-sm" : "pl-9"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={cn(
              "flex gap-2",
              isMobile ? "flex-col" : "flex-row flex-wrap"
            )}>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className={cn(
                  isMobile ? "w-full" : "w-[180px]"
                )}>
                  <div className="flex items-center">
                    <Filter className={cn(
                      "mr-2",
                      isMobile ? "h-3 w-3" : "h-4 w-4"
                    )} />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={cn(
                  isMobile ? "w-full" : "w-[180px]"
                )}>
                  <div className="flex items-center">
                    <Filter className={cn(
                      "mr-2",
                      isMobile ? "h-3 w-3" : "h-4 w-4"
                    )} />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isMobile ? (
            // Mobile card layout
            <div className="space-y-3">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="overflow-hidden shadow-sm">
                    <CardHeader className="p-3 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm font-semibold truncate">
                            {supplier.name}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground mt-1">
                            {supplier.category}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 touch-target">
                                <MoreHorizontal className="h-3 w-3" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-3 w-3" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-3 w-3" />
                                Edit Supplier
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-3 w-3" />
                                Contact
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Contact</span>
                          <div className="text-right">
                            <div className="text-xs font-medium">{supplier.contactName}</div>
                            <div className="text-[10px] text-muted-foreground">{supplier.email}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Rating</span>
                          <div className="flex items-center gap-1">
                            {getRatingStars(supplier.rating)}
                            <span className="text-xs font-medium">{supplier.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Lead Time</span>
                          <span className="text-xs font-medium">{supplier.leadTime} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Reliability</span>
                          <div className="flex items-center gap-2">
                            <Progress value={supplier.reliability} className="h-1 w-12" />
                            <span className="text-xs font-medium">{supplier.reliability}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <Badge variant={getStatusBadgeVariant(supplier.status)} className="text-xs">
                            {supplier.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No suppliers found.</p>
                </div>
              )}
            </div>
          ) : (
            // Desktop table layout
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Supplier Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Reliability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.category}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{supplier.contactName}</span>
                              <span className="text-xs text-muted-foreground">{supplier.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getRatingStars(supplier.rating)}
                              <span className="ml-2 text-sm">{supplier.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>{supplier.leadTime} days</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Progress value={supplier.reliability} className="h-2" />
                              <span className="text-xs text-right">{supplier.reliability}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(supplier.status)}>{supplier.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="touch-target">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Supplier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Truck className="mr-2 h-4 w-4" />
                                  Create Purchase Order
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Contact Supplier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MapPin className="mr-2 h-4 w-4" />
                                  View Address
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Visit Website
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Call Supplier
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No suppliers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </RContainer>
  )
}
