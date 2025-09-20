"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Product, InventoryItem, Category } from "../lib/db";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "../components/ui/dialog";
import { CheckCircle2, AlertTriangle, XCircle, PlusCircle, Edit, Trash2, Search, Filter, PackageOpen, Package, PackageX, Warehouse, ShoppingCart, DollarSign, Tag, Palette, Weight, Ruler, Calendar, Info, ListFilter, FileText, Image as ImageIcon, GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import AddEditProductPage from "./add-edit-product"; // 修复导入语句，使用默认导出
import { toast } from '../hooks/use-toast'; // 修正 toast 导入路径
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useResponsive } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ResponsiveContainer as RContainer } from '@/components/responsive-container';

// Helper function to calculate total stock for a product
const calculateTotalStock = (productId: string | number, inventoryItems: InventoryItem[]): number => {
  return inventoryItems
    .filter(item => String(item.productId) === String(productId))
    .reduce((sum, item) => sum + (item.quantity || 0), 0);
};

export interface ProductWithStock extends Product {
  totalStock: number;
  lowStockThreshold?: number; // 添加缺少的属性
  supplierId?: number;
  weight?: number;
  weightUnit?: string;
  dimensions?: string;
  color?: string;
  material?: string;
  expirationDate?: Date;
  dateAdded?: Date;
  lastModified?: Date;
}

export default function InventoryPage() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  // State for managing products and inventory
  const allProducts = useLiveQuery(() => db.products.toArray(), []) || [];
  const allInventoryItems = useLiveQuery(() => db.inventory.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];

  // State for UI controls
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | undefined>(undefined);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | undefined>(undefined);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof Product | 'stock' | 'status' | 'category'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(['name', 'sku', 'category', 'stock', 'status', 'price', 'actions']));
  const [columnOrder, setColumnOrder] = useState<string[]>(['name', 'sku', 'category', 'stock', 'status', 'price', 'actions']);


  // Use the enhanced responsive hook
  const { isMobile, isTablet, isDesktop } = useResponsive();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const categoryMap = useMemo(() => {
    if (!categories) return new Map<number, string>();
    return new Map(categories.map((cat: Category) => [cat.id!, cat.name]));
  }, [categories]);

  const productsWithStock = useMemo(() => {
    return allProducts.map(product => ({
      ...product,
      totalStock: calculateTotalStock(product.id!, allInventoryItems),
      lowStockThreshold: 10, // 为所有产品设置默认值
    } as ProductWithStock));
  }, [allProducts, allInventoryItems]);

  const getProductStatus = useCallback((product: ProductWithStock) => {
    const stock = product.totalStock;
    const lowStockThreshold = product.lowStockThreshold ?? 10; // Default low stock threshold
    if (stock === 0) {
      return { text: t('status.outOfStock'), color: "text-red-500", icon: <XCircle className="mr-2 h-4 w-4" />, variant: "destructive" as const };
    }
    if (stock < lowStockThreshold) {
      return { text: t('status.lowStock'), color: "text-yellow-500", icon: <AlertTriangle className="mr-2 h-4 w-4" />, variant: "secondary" as const };
    }
    return { text: t('status.inStock'), color: "text-green-500", icon: <CheckCircle2 className="mr-2 h-4 w-4" />, variant: "default" as const };
  }, [t]);


  const filteredAndSortedItems = useMemo(() => {
    let items = productsWithStock.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchLower) ||
        (item.sku && item.sku.toLowerCase().includes(searchLower)) ||
        (categoryMap.get(item.categoryId!) || '').toLowerCase().includes(searchLower);

      const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter;

      const statusInfo = getProductStatus(item);
      const matchesStatus = statusFilter === "all" || statusInfo.text === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sorting
    items.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortColumn === 'stock') {
        valA = a.totalStock;
        valB = b.totalStock;
      } else if (sortColumn === 'status') {
        valA = getProductStatus(a).text;
        valB = getProductStatus(b).text;
      } else if (sortColumn === 'category') {
        // 将 'category' 视为特殊情况处理
        valA = categoryMap.get(a.categoryId!) || '';
        valB = categoryMap.get(b.categoryId!) || '';
      } else {
        valA = a[sortColumn];
        valB = b[sortColumn];
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });

    return items;
  }, [productsWithStock, searchQuery, categoryFilter, statusFilter, categoryMap, getProductStatus, sortColumn, sortDirection]);


  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);


  const handleAddNewProduct = () => {
    setEditingProductId(undefined);
    setIsAddEditDialogOpen(true);
  };

  const handleEditProduct = (productId: number | undefined) => {
    if (!productId) {
      toast({ title: t('error.title'), description: t('error.productIdMissing'), variant: "destructive" });
      return;
    }
    setEditingProductId(productId);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete || !productToDelete.id) {
      toast({ title: t('error.title'), description: t('error.productNotFound'), variant: "destructive" });
      return;
    }
    try {
      // First, delete related inventory items
      const relatedInventoryItems = await db.inventory.where('productId').equals(productToDelete.id).toArray();
      const inventoryItemIds = relatedInventoryItems.map(item => item.id!);
      if (inventoryItemIds.length > 0) {
        await db.inventory.bulkDelete(inventoryItemIds);
      }
      // Then, delete the product
      await db.products.delete(productToDelete.id);
      toast({ title: t('success.title'), description: t('success.productDeleted', { productName: productToDelete.name }) });
      setProductToDelete(undefined);
      setIsConfirmDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: t('error.title'), description: t('error.deleteFailed'), variant: "destructive" });
    }
  };

  const handleProductAddedOrUpdated = () => {
    setIsAddEditDialogOpen(false); // Close dialog
    // Optionally, refresh data or show a success message
    toast({ title: t('success.title'), description: editingProductId ? t('success.productUpdated') : t('success.productAdded') });
  };

  const confirmDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsConfirmDeleteDialogOpen(true);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    const items = Array.from(columnOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setColumnOrder(items);
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  const handleSort = (column: keyof Product | 'stock' | 'status' | 'category') => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  if (!isClient) {
    return <div className="flex justify-center items-center h-screen"><Package className="h-16 w-16 animate-spin" /> <p className="ml-4 text-xl">{t('loading.inventory')}</p></div>;
  }

  const lowStockProducts = productsWithStock.filter(p => getProductStatus(p).text === t('status.lowStock'));

  if (showLowStockAlert && lowStockProducts.length > 0) {
    toast({
      title: t('alert.lowStock.title'),
      description: t('alert.lowStock.message', { count: lowStockProducts.length }),
      variant: "default", // Or "warning" if you have such a variant
      action: (
        <Button onClick={() => {
          setStatusFilter(t('status.lowStock'));
          // find a way to close the toast if needed, or it auto-closes
        }}>
          {t('alert.lowStock.viewButton')}
        </Button>
      ),
    });
    setShowLowStockAlert(false); // Reset after showing
  }


  const availableColumns: { key: string; label: string; icon?: React.ReactNode, sortable?: boolean }[] = [
    { key: 'name', label: t('product.name'), icon: <Package className="mr-2 h-4 w-4" />, sortable: true },
    { key: 'sku', label: t('product.sku'), icon: <Tag className="mr-2 h-4 w-4" />, sortable: true },
    { key: 'category', label: t('product.category'), icon: <ListFilter className="mr-2 h-4 w-4" />, sortable: true },
    { key: 'stock', label: t('inventory.stock'), icon: <Warehouse className="mr-2 h-4 w-4" />, sortable: true },
    { key: 'status', label: t('inventory.status'), icon: <Info className="mr-2 h-4 w-4" />, sortable: true },
    { key: 'price', label: t('product.price'), icon: <DollarSign className="mr-2 h-4 w-4" />, sortable: true },
    // Add other potential columns here if needed for the "Configure Columns" dropdown
    { key: 'supplier', label: t('product.supplier'), icon: <PackageOpen className="mr-2 h-4 w-4" /> },
    { key: 'barcode', label: t('product.barcode'), icon: <GripVertical className="mr-2 h-4 w-4" /> }, // Placeholder icon
    { key: 'description', label: t('product.description'), icon: <FileText className="mr-2 h-4 w-4" /> },
    { key: 'imageUrl', label: t('product.image'), icon: <ImageIcon className="mr-2 h-4 w-4" /> },
    { key: 'weight', label: t('product.weight'), icon: <Weight className="mr-2 h-4 w-4" /> },
    { key: 'dimensions', label: t('product.dimensions'), icon: <Ruler className="mr-2 h-4 w-4" /> },
    { key: 'color', label: t('product.color'), icon: <Palette className="mr-2 h-4 w-4" /> },
    { key: 'material', label: t('product.material'), icon: <Package className="mr-2 h-4 w-4" /> }, // Placeholder
    { key: 'expirationDate', label: t('product.expirationDate'), icon: <Calendar className="mr-2 h-4 w-4" /> },
    { key: 'dateAdded', label: t('product.dateAdded'), icon: <Calendar className="mr-2 h-4 w-4" /> },
    { key: 'lastModified', label: t('product.lastModified'), icon: <Calendar className="mr-2 h-4 w-4" /> },
    { key: 'lowStockThreshold', label: t('product.lowStockThreshold'), icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
    { key: 'actions', label: t('table.actions'), icon: <Edit className="mr-2 h-4 w-4" /> }, // Actions column is not sortable by content
  ];

  const currentVisibleColumnsDetails = columnOrder
    .filter(key => visibleColumns.has(key))
    .map(key => availableColumns.find(col => col.key === key)).filter(Boolean) as { key: string; label: string; icon?: React.ReactNode, sortable?: boolean }[];


  return (
    <RContainer fullWidth padding="md">
      {/* Enhanced responsive header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <div className="flex items-center min-w-0 flex-1">
          <Package className={cn(
            "mr-2 md:mr-3 text-primary flex-shrink-0",
            isMobile ? "h-5 w-5" : "h-6 w-6 md:h-8 md:w-8"
          )} />
          <h1 className={cn(
            "font-bold tracking-tight truncate",
            isMobile ? "text-xl" : "text-2xl md:text-3xl"
          )}>
            {t('inventory.title')}
          </h1>
        </div>
        <Button
          onClick={handleAddNewProduct}
          size={isMobile ? "default" : "lg"}
          className="w-full sm:w-auto touch-target"
        >
          <PlusCircle className={cn(
            "mr-2",
            isMobile ? "h-4 w-4" : "h-5 w-5"
          )} />
          <span className={isMobile ? "text-sm" : undefined}>
            {t('inventory.addNewProduct')}
          </span>
        </Button>
      </header>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className={cn(
          "dialog-mobile",
          isMobile
            ? "w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] m-2 p-0 flex flex-col"
            : "w-[95vw] max-w-[600px]"
        )}>
          <DialogHeader className={cn(isMobile ? "p-4 pb-2 flex-shrink-0" : "")}>
            <DialogTitle className={cn(isMobile ? "text-lg" : "")}>
              {editingProductId ? t('inventory.editProduct') : t('inventory.addNewProduct')}
            </DialogTitle>
          </DialogHeader>
          <div className={cn(
            "overflow-y-auto flex-1",
            isMobile ? "px-4 pb-4" : ""
          )}>
            <AddEditProductPage
              productId={editingProductId}
              onProductAddedOrUpdated={handleProductAddedOrUpdated}
              categories={categories}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>{t('confirmDelete.title')}</DialogTitle>
          </DialogHeader>
          <p>{t('confirmDelete.message', { productName: productToDelete?.name })}</p>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsConfirmDeleteDialogOpen(false)} className="w-full sm:w-auto">
              {t('actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct} className="w-full sm:w-auto">
              {t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters and Actions */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('inventory.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Select value={categoryFilter === "all" ? "all" : String(categoryFilter)} onValueChange={(value) => setCategoryFilter(value === "all" ? "all" : Number(value))}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder={t('inventory.filterByCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('inventory.allCategories')}</SelectItem>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={String(category.id!)}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder={t('inventory.filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('inventory.allStatuses')}</SelectItem>
                    <SelectItem value={t('status.inStock')}>{t('status.inStock')}</SelectItem>
                    <SelectItem value={t('status.lowStock')}>{t('status.lowStock')}</SelectItem>
                    <SelectItem value={t('status.outOfStock')}>{t('status.outOfStock')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-between">
              {/* 移除了 configureColumns 按钮 */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary Cards */}
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
              {t('summary.totalProducts')}
            </CardTitle>
            <Package className={cn(
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
              {allProducts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('summary.totalStockValue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">
              {new Intl.NumberFormat('default', { style: 'currency', currency: 'USD' }).format(
                productsWithStock.reduce((sum, p) => sum + (p.price || 0) * p.totalStock, 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('summary.lowStockItems')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{lowStockProducts.length}</div>
            {lowStockProducts.length > 0 && (
              <Button variant="link" size="sm" className="px-0 h-6" onClick={() => setStatusFilter(t('status.lowStock'))}>
                {t('actions.viewItems')}
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('summary.outOfStockItems')}</CardTitle>
            <PackageX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{productsWithStock.filter(p => p.totalStock === 0).length}</div>
            {productsWithStock.filter(p => p.totalStock === 0).length > 0 && (
              <Button variant="link" size="sm" className="px-0 h-6" onClick={() => setStatusFilter(t('status.outOfStock'))}>
                {t('actions.viewItems')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Responsive Inventory Table */}
      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          {isMobile ? (
            // Enhanced mobile view with better card layout
            <div className="space-y-3 p-3 max-w-full">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => {
                  const statusDisplay = getProductStatus(item);
                  const categoryName = categoryMap.get(item.categoryId!) || t('inventory.unknownCategory');
                  return (
                    <Card key={item.id} className="overflow-hidden shadow-sm w-full">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-sm font-medium flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold truncate">{item.name}</div>
                            {item.sku && (
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {t('product.sku')}: {item.sku}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 touch-target"
                              onClick={() => handleEditProduct(item.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 touch-target"
                              onClick={() => confirmDeleteProduct(item)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{t('product.category')}</span>
                            <span className="text-xs font-medium">{categoryName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{t('inventory.stock')}</span>
                            <span className="text-sm font-semibold">{item.totalStock}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{t('inventory.status')}</span>
                            <Badge variant={statusDisplay.variant} className={cn("text-xs", statusDisplay.color)}>
                              {statusDisplay.icon}
                              <span className="ml-1">{statusDisplay.text}</span>
                            </Badge>
                          </div>
                          {item.price !== undefined && (
                            <div className="flex justify-between items-center pt-1 border-t">
                              <span className="text-xs text-muted-foreground">{t('product.price')}</span>
                              <span className="text-sm font-semibold">
                                {new Intl.NumberFormat('default', { style: 'currency', currency: 'USD' }).format(item.price)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('inventory.noProductsFound')}</p>
                </div>
              )}
            </div>
          ) : (
            // Desktop view - optimized table with proper mobile fallback
            <div className="table-mobile-wrapper">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {currentVisibleColumnsDetails.map((col) => (
                        <TableHead key={col.key} className={col.sortable ? "cursor-pointer hover:bg-muted/50 whitespace-nowrap" : "whitespace-nowrap"} onClick={col.sortable ? () => handleSort(col.key as any) : undefined}>
                          <div className="flex items-center">
                            {col.icon}
                            {col.label}
                            {sortColumn === col.key && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.length > 0 ? (
                      paginatedItems.map((item) => {
                        const statusDisplay = getProductStatus(item);
                        const categoryName = categoryMap.get(item.categoryId!) || t('inventory.unknownCategory');
                        return (
                          <TableRow key={item.id}>
                            {currentVisibleColumnsDetails.map(col => {
                               if (col.key === 'name') return <TableCell key={col.key} className="font-medium whitespace-nowrap">{item.name}</TableCell>;
                               if (col.key === 'sku') return <TableCell key={col.key} className="whitespace-nowrap">{item.sku}</TableCell>;
                               if (col.key === 'category') return <TableCell key={col.key} className="whitespace-nowrap">{categoryName}</TableCell>;
                               if (col.key === 'stock') return <TableCell key={col.key} className="whitespace-nowrap">{item.totalStock}</TableCell>;
                               if (col.key === 'status') return <TableCell key={col.key} className="whitespace-nowrap"><Badge variant={statusDisplay.variant} className={statusDisplay.color}>{statusDisplay.icon}{statusDisplay.text}</Badge></TableCell>;
                               if (col.key === 'price') return <TableCell key={col.key} className="whitespace-nowrap">{item.price ? new Intl.NumberFormat('default', { style: 'currency', currency: 'USD' }).format(item.price) : 'N/A'}</TableCell>; // TODO: Make currency configurable
                               if (col.key === 'supplier') return <TableCell key={col.key} className="whitespace-nowrap">{item.supplierId ? `SupplierID: ${item.supplierId}` : 'N/A'}</TableCell>; // Example, needs actual supplier name
                               if (col.key === 'barcode') return <TableCell key={col.key} className="whitespace-nowrap">{item.barcode || 'N/A'}</TableCell>;
                               if (col.key === 'description') return <TableCell key={col.key} className="max-w-[200px] truncate">{item.description || 'N/A'}</TableCell>;
                               if (col.key === 'imageUrl') return <TableCell key={col.key} className="whitespace-nowrap">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-10 w-10 object-cover rounded"/> : 'N/A'}</TableCell>;
                               if (col.key === 'weight') return <TableCell key={col.key} className="whitespace-nowrap">{item.weight ? `${item.weight} ${item.weightUnit || ''}` : 'N/A'}</TableCell>;
                               if (col.key === 'dimensions') return <TableCell key={col.key} className="whitespace-nowrap">{item.dimensions || 'N/A'}</TableCell>;
                               if (col.key === 'color') return <TableCell key={col.key} className="whitespace-nowrap">{item.color || 'N/A'}</TableCell>;
                               if (col.key === 'material') return <TableCell key={col.key} className="whitespace-nowrap">{item.material || 'N/A'}</TableCell>;
                               if (col.key === 'expirationDate') return <TableCell key={col.key} className="whitespace-nowrap">{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A'}</TableCell>;
                               if (col.key === 'dateAdded') return <TableCell key={col.key} className="whitespace-nowrap">{item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}</TableCell>;
                               if (col.key === 'lastModified') return <TableCell key={col.key} className="whitespace-nowrap">{item.lastModified ? new Date(item.lastModified).toLocaleDateString() : 'N/A'}</TableCell>;
                               if (col.key === 'lowStockThreshold') return <TableCell key={col.key} className="whitespace-nowrap">{item.lowStockThreshold ?? 'N/A'}</TableCell>;

                               if (col.key === 'actions') return (
                                <TableCell key={col.key} className="whitespace-nowrap">
                                  <div className="flex justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditProduct(item.id)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => confirmDeleteProduct(item)}>
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                               );
                               return <TableCell key={col.key} className="whitespace-nowrap">N/A</TableCell>; // Fallback for unhandled visible columns
                            })}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={currentVisibleColumnsDetails.length} className="text-center h-24">
                          {t('inventory.noProductsFound')}
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

      {/* Pagination - 响应式布局调整 */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 md:mt-6">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            {t('pagination.page', { currentPage: currentPage, totalPages: totalPages })}
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              {t('pagination.previous')}
            </Button>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                    {[5, 10, 20, 50, 100].map(val => (
                        <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              {t('pagination.next')}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground order-3 sm:order-3">
            {t('pagination.totalItems', { count: filteredAndSortedItems.length })}
          </div>
        </div>
      )}
    </RContainer>
  );
}

// Make sure to have translations for all t('...') keys in your i18n files.
// Example keys to add:
// "inventory.title": "Inventory Management",
// "inventory.addNewProduct": "Add New Product",
// "inventory.editProduct": "Edit Product",
// "inventory.searchPlaceholder": "Search products by name, SKU, category...",
// "inventory.filterByCategory": "Filter by category",
// "inventory.allCategories": "All Categories",
// "inventory.filterByStatus": "Filter by status",
// "inventory.allStatuses": "All Statuses",
// "inventory.noProductsFound": "No products found.",
// "inventory.unknownCategory": "Unknown Category",
// "inventory.stock": "Stock",
// "inventory.status": "Status",
// "status.inStock": "In Stock",
// "status.lowStock": "Low Stock",
// "status.outOfStock": "Out of Stock",
// "product.name": "Name",
// "product.sku": "SKU",
// "product.category": "Category",
// "product.price": "Price",
// "table.actions": "Actions",
// "actions.edit": "Edit",
// "actions.delete": "Delete",
// "actions.cancel": "Cancel",
// "actions.confirm": "Confirm",
// "confirmDelete.title": "Confirm Deletion",
// "confirmDelete.message": "Are you sure you want to delete product \"{{productName}}\"?",
// "error.title": "Error",
// "error.productIdMissing": "Product ID is missing.",
// "error.productNotFound": "Product not found.",
// "error.deleteFailed": "Failed to delete product.",
// "success.title": "Success",
// "success.productAdded": "Product added successfully.",
// "success.productUpdated": "Product updated successfully.",
// "success.productDeleted": "Product \"{{productName}}\" deleted successfully.",
// "loading.inventory": "Loading inventory data...",
// "alert.lowStock.title": "Low Stock Alert",
// "alert.lowStock.message": "{{count}} product(s) are low on stock.",
// "alert.lowStock.viewButton": "View Items",
// "summary.totalProducts": "Total Products",
// "summary.totalStockValue": "Total Stock Value",
// "summary.lowStockItems": "Low Stock Items",
// "summary.outOfStockItems": "Out of Stock Items",
// "actions.viewItems": "View items",
// "pagination.page": "Page {{currentPage}} of {{totalPages}}",
// "pagination.previous": "Previous",
// "pagination.next": "Next",
// "pagination.totalItems": "{{count}} items",
// "inventory.configureColumns": "Configure Columns",
// "inventory.dragToReorder": "Drag to reorder columns.",
// "product.supplier": "Supplier",
// "product.barcode": "Barcode",
// "product.description": "Description",
// "product.image": "Image",
// "product.weight": "Weight",
// "product.dimensions": "Dimensions",
// "product.color": "Color",
// "product.material": "Material",
// "product.expirationDate": "Expiration Date",
// "product.dateAdded": "Date Added",
// "product.lastModified": "Last Modified",
// "product.lowStockThreshold": "Low Stock Threshold",
// "inventory.overviewChartTitle": "Inventory Overview (Top 10 Products by Stock)",
// "chartTooltip.totalStock": "Total Stock",
// "chartTooltip.lowStockThreshold": "Low Stock Threshold",
// "chartLegend.totalStock": "Total Stock",
// "chartLegend.lowStockThreshold": "Low Stock Threshold"

// Ensure AddEditProductSheet component exists and is correctly imported.
// It should accept `productId`, `onProductAddedOrUpdated`, and `categories` props.
// Example:
// export function AddEditProductSheet({ productId, onProductAddedOrUpdated, categories }) {
//   // ... sheet implementation ...
//   return ( <div>Sheet Content</div> );
// }
