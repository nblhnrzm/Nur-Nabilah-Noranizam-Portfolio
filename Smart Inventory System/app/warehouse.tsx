"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Loader2,
  LayoutGrid,
  Warehouse as WarehouseIcon,
  BarChartHorizontalBig,
  PackageSearch,
  AlertTriangle,
  Info,
  ArrowRightLeft, // For stock operations
  Download, // For Stock In
  Upload, // For Stock Out
} from 'lucide-react';
import { db, Zone as DbZone, stockInOperation, stockOutOperation, Product as DbProduct, Warehouse as DbWarehouse } from '@/lib/db'; // Import AppDB and operations
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Added Tooltip imports
import { FloatingActionButton } from "@/components/floating-action-button";
import { useResponsive } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ResponsiveContainer as RContainer } from "@/components/responsive-container";


// Use DbZone from lib/db.ts, but keep the local interface for component state if needed or adapt
// For simplicity, we'll try to use DbZone directly or a slightly adapted version if necessary.
interface Zone extends DbZone {
    description?: string; // Re-add description if it's used in the component but not in DbZone
}
interface Product extends DbProduct {}
interface Warehouse extends DbWarehouse {}

// API functions will now directly use imported db operations or query AppDB
// Adjust existing API functions to use the centralized db instance and types

const fetchZonesFromAPI = async (): Promise<Zone[]> => {
  console.log("Fetching zones from AppDB...");
  // await populateInitialData(); // This logic might need to be re-evaluated or moved to a global app setup
  try {
    const zones = await db.zones.toArray();
    return zones.map(z => ({...z, id: z.id!})); // Ensure id is treated as string if your component expects it, or adjust component
  } catch (error) {
    console.error("Failed to fetch zones from AppDB:", error);
    throw error;
  }
};

const saveZoneToAPI = async (zoneData: Omit<Zone, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): Promise<Zone> => {
  console.log("Saving zone to AppDB:", zoneData);
  try {
    const now = new Date();
    let savedZoneId: number;

    if (zoneData.id) { // Editing existing zone
      await db.zones.update(zoneData.id, { ...zoneData, updatedAt: now });
      savedZoneId = zoneData.id;
    } else { // Adding new zone
      // Ensure warehouseId is present and valid before saving
      if (typeof zoneData.warehouseId !== 'number') {
        throw new Error("Warehouse ID is required to save a zone.");
      }
      savedZoneId = await db.zones.add({
        ...zoneData,
        createdAt: now,
        updatedAt: now,
        utilized: zoneData.utilized || 0, // Ensure utilized is set
      } as DbZone); // Type assertion
    }
    const savedZone = await db.zones.get(savedZoneId);
    if (!savedZone || typeof savedZone.id === 'undefined') throw new Error("Failed to retrieve saved zone");
    return { ...savedZone, id: savedZone.id! };
  } catch (error) {
    console.error("Failed to save zone to AppDB:", error);
    throw error;
  }
};

const deleteZoneFromAPI = async (zoneId: number): Promise<void> => {
  console.log("Deleting zone from AppDB, ID:", zoneId);
  try {
    await db.zones.delete(zoneId);
  } catch (error) {
    console.error("Failed to delete zone from AppDB:", error);
    throw error;
  }
};

// No need for adjustZoneUtilizationInAPI here as it's part of stockIn/Out operations in db.ts

export default function WarehousePage() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [zones, setZones] = useState<Zone[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]); // Assuming you might want to select a warehouse for a zone
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState<Partial<Zone> | null>(null);
  const [zoneNameInput, setZoneNameInput] = useState('');
  const [zoneTypeInput, setZoneTypeInput] = useState('');
  const [zoneDescriptionInput, setZoneDescriptionInput] = useState('');
  const [zoneCapacityInput, setZoneCapacityInput] = useState<number | ''>('');
  const [zoneUtilizedInput, setZoneUtilizedInput] = useState<number | ''>('');
  const [selectedWarehouseIdForNewZone, setSelectedWarehouseIdForNewZone] = useState<number | undefined>();

  // State for Stock In/Out Dialog
  const [isStockOpDialogOpen, setIsStockOpDialogOpen] = useState(false);
  const [stockOpType, setStockOpType] = useState<'in' | 'out'>('in');
  const [selectedProductForOp, setSelectedProductForOp] = useState<number | undefined>();
  const [selectedZoneForOp, setSelectedZoneForOp] = useState<number | undefined>();
  const [stockOpQuantity, setStockOpQuantity] = useState<number | ''>('');
  const [stockOpReference, setStockOpReference] = useState('');
  const [stockOpNotes, setStockOpNotes] = useState('');
  const [isStockOpSaving, setIsStockOpSaving] = useState(false);


  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Populate initial data if db is empty (example for products and warehouses)
      // This should ideally be handled at a higher level or on first app load.
      if (await db.products.count() === 0) {
        await db.products.bulkAdd([
          { name: 'Laptop X1', sku: 'LPX1-001', price: 1200, createdAt: new Date(), updatedAt: new Date() },
          { name: 'Wireless Mouse', sku: 'WM-005', price: 25, createdAt: new Date(), updatedAt: new Date() },
        ] as DbProduct[]);
      }
      if (await db.warehouses.count() === 0) {
        await db.warehouses.bulkAdd([
          { name: 'Main Warehouse', location: '123 Industrial Dr', status: 'active', createdAt: new Date(), updatedAt: new Date() },
          { name: 'Secondary Storage', location: '456 Commerce Ave', status: 'active', createdAt: new Date(), updatedAt: new Date() },
        ] as DbWarehouse[]);
      }
      // Initial mock zones if zones table is empty
      if (await db.zones.count() === 0 && await db.warehouses.count() > 0) {
        const firstWarehouse = await db.warehouses.orderBy('id').first();
        if (firstWarehouse && firstWarehouse.id) {
            const initialMockZones: Omit<DbZone, 'id' | 'createdAt' | 'updatedAt'>[] = [
                { warehouseId: firstWarehouse.id, name: 'Receiving Bay', type: 'Receiving', capacity: 100, utilized: 0 },
                { warehouseId: firstWarehouse.id, name: 'Bulk Storage A', type: 'Pallet Racking', capacity: 500, utilized: 0 },
            ];
            await db.zones.bulkAdd(initialMockZones.map(z => ({...z, createdAt: new Date(), updatedAt: new Date()})) as DbZone[]);
        }
      }

      const fetchedZones = await fetchZonesFromAPI();
      const fetchedProducts = await db.products.toArray();
      const fetchedWarehouses = await db.warehouses.toArray();
      setZones(fetchedZones.map(z => ({...z, id: z.id! })));
      setProducts(fetchedProducts.map(p => ({...p, id: p.id! })));
      setWarehouses(fetchedWarehouses.map(w => ({...w, id: w.id! })));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data.';
      setError(errorMessage);
      toast({ title: "Error Loading Data", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const openAddZoneDialog = () => {
    setCurrentZone(null);
    setZoneNameInput('');
    setZoneTypeInput('');
    setZoneDescriptionInput('');
    setZoneCapacityInput('');
    setZoneUtilizedInput(0); // Default utilized to 0 for new zones
    setSelectedWarehouseIdForNewZone(warehouses.length > 0 ? warehouses[0].id : undefined); // Pre-select first warehouse
    setIsZoneDialogOpen(true);
  };

  const openEditZoneDialog = (zone: Zone) => {
    setCurrentZone(zone);
    setZoneNameInput(zone.name);
    setZoneTypeInput(zone.type || '');
    setZoneDescriptionInput(zone.description || ''); // Use re-added description
    setZoneCapacityInput(zone.capacity);
    setZoneUtilizedInput(zone.utilized);
    setSelectedWarehouseIdForNewZone(zone.warehouseId); // Set current warehouse for editing
    setIsZoneDialogOpen(true);
  };

  const handleDeleteZone = async (zoneId: number | string) => {
    // Ensure zoneId is number for DB operation
    const idNum = typeof zoneId === 'string' ? parseInt(zoneId) : zoneId;
    if (isNaN(idNum)) {
        toast({ title: "Error", description: "Invalid zone ID for deletion.", variant: "destructive" });
        return;
    }
    if (!window.confirm("Are you sure you want to delete this zone? This action cannot be undone.")) return;

    try {
      await deleteZoneFromAPI(idNum);
      setZones(prevZones => prevZones.filter(z => z.id !== idNum));
      toast({ title: "Zone Deleted", description: "The zone has been successfully removed." });
    } catch (err) {
      toast({ title: "Error Deleting Zone", description: "Failed to delete the zone. Please try again.", variant: "destructive" });
    }
  };

  const handleSaveZone = async () => {
    if (!zoneNameInput.trim()) {
      toast({ title: "Validation Error", description: "Zone name is required.", variant: "destructive" });
      return;
    }
    if (zoneCapacityInput === '' || zoneCapacityInput < 0) {
      toast({ title: "Validation Error", description: "Valid zone capacity is required.", variant: "destructive" });
      return;
    }
     if (zoneUtilizedInput === '' || zoneUtilizedInput < 0) {
      toast({ title: "Validation Error", description: "Valid zone utilization is required.", variant: "destructive" });
      return;
    }
    if (zoneUtilizedInput > zoneCapacityInput) {
      toast({ title: "Validation Error", description: "Utilization cannot exceed capacity.", variant: "destructive" });
      return;
    }
    if (currentZone === null && typeof selectedWarehouseIdForNewZone !== 'number') {
      toast({ title: "Validation Error", description: "Please select a warehouse for the new zone.", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    const zoneDataToSave: Omit<Zone, 'id' | 'createdAt' | 'updatedAt'> & { id?: number, warehouseId: number, description?: string } = {
      ...(currentZone?.id ? { id: currentZone.id } : {}),
      name: zoneNameInput.trim(),
      type: zoneTypeInput.trim(),
      description: zoneDescriptionInput.trim(), // Include description
      capacity: Number(zoneCapacityInput),
      utilized: Number(zoneUtilizedInput),
      warehouseId: currentZone?.warehouseId ?? selectedWarehouseIdForNewZone!,
    };

    try {
      const savedZone = await saveZoneToAPI(zoneDataToSave);
      if (currentZone?.id) {
        setZones(prevZones => prevZones.map(z => z.id === savedZone.id ? savedZone : z));
      } else {
        setZones(prevZones => [...prevZones, savedZone]);
      }
      toast({ title: "Zone Saved", description: `Zone "${savedZone.name}" ${currentZone?.id ? 'updated' : 'added'} successfully.` });
      setIsZoneDialogOpen(false);
      setCurrentZone(null);
    } catch (err) {
      toast({ title: "Error Saving Zone", description: `Failed to save zone. Please try again.`, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const getUtilizationPercentage = (utilized: number, capacity: number) => {
    if (capacity === 0) return 0;
    return Math.round((utilized / capacity) * 100);
  };

  const getUtilizationColorClass = (percentage: number) => {
    if (percentage < 50) return "bg-green-500"; // text-green-700 for text
    if (percentage < 85) return "bg-yellow-500"; // text-yellow-700
    return "bg-red-500"; // text-red-700
  };

  // Calculate overall warehouse stats
  const totalZones = zones.length;
  const totalCapacity = zones.reduce((acc, zone) => acc + zone.capacity, 0);
  const totalUtilized = zones.reduce((acc, zone) => acc + zone.utilized, 0);
  const overallUtilizationPercentage = getUtilizationPercentage(totalUtilized, totalCapacity);

  // Handler for opening stock operation dialog
  const openStockOpDialog = (type: 'in' | 'out', zone?: Zone) => { // Zone is now optional from FAB
    setStockOpType(type);
    setSelectedProductForOp(products.length > 0 ? products[0].id : undefined);
    // If called from FAB, zone will be undefined. User must select zone in dialog.
    // If called with a zone (e.g. future feature), it can be pre-selected.
    setSelectedZoneForOp(zone?.id ?? (zones.length > 0 ? zones[0].id : undefined));
    setStockOpQuantity('');
    setStockOpReference('');
    setStockOpNotes('');
    setIsStockOpDialogOpen(true);
  };

  // Handler for saving stock operation
  const handleSaveStockOperation = async () => {
    if (!selectedProductForOp || !selectedZoneForOp || stockOpQuantity === '' || Number(stockOpQuantity) <= 0) {
      toast({ title: "Validation Error", description: "Please select product, zone, and enter a valid quantity.", variant: "destructive" });
      return;
    }

    setIsStockOpSaving(true);
    try {
      const quantity = Number(stockOpQuantity);
      const zone = zones.find(z => z.id === selectedZoneForOp);
      if (!zone || typeof zone.warehouseId !== 'number') {
        toast({ title: "Error", description: "Selected zone or its warehouse ID is invalid.", variant: "destructive" });
        setIsStockOpSaving(false);
        return;
      }

      if (stockOpType === 'in') {
        await stockInOperation(selectedProductForOp, quantity, zone.warehouseId, selectedZoneForOp, {
          referenceId: stockOpReference,
          notes: stockOpNotes,
        });
        toast({ title: "Stock In Successful", description: `${quantity} units of Product ID ${selectedProductForOp} added to Zone ID ${selectedZoneForOp}.` });
      } else {
        await stockOutOperation(selectedProductForOp, quantity, zone.warehouseId, selectedZoneForOp, {
          referenceId: stockOpReference,
          notes: stockOpNotes,
        });
        toast({ title: "Stock Out Successful", description: `${quantity} units of Product ID ${selectedProductForOp} removed from Zone ID ${selectedZoneForOp}.` });
      }
      // Refresh zones data to reflect utilization changes
      const fetchedZones = await fetchZonesFromAPI();
      setZones(fetchedZones.map(z => ({...z, id: z.id! })));
      setIsStockOpDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to perform stock ${stockOpType} operation.`;
      toast({ title: `Error Stock ${stockOpType === 'in' ? 'In' : 'Out'}`, description: errorMessage, variant: "destructive" });
    } finally {
      setIsStockOpSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Your Warehouse Zones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadInitialData} variant="outline">
          <LayoutGrid className="mr-2 h-4 w-4" /> {/* Using LayoutGrid as a generic retry icon */}
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <RContainer fullWidth padding="md">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <div className="flex items-center min-w-0 flex-1">
          <WarehouseIcon className={cn(
            "mr-2 md:mr-3 text-primary flex-shrink-0",
            isMobile ? "h-5 w-5" : "h-6 w-6 md:h-8 md:w-8"
          )} />
          <h1 className={cn(
            "font-bold tracking-tight truncate",
            isMobile ? "text-xl" : "text-2xl md:text-3xl"
          )}>
            Warehouse Management
          </h1>
        </div>
        <Button
          onClick={openAddZoneDialog}
          size={isMobile ? "default" : "lg"}
          className="w-full sm:w-auto touch-target"
        >
          <PlusCircle className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
          <span className={isMobile ? "text-sm" : undefined}>
            Add New Zone
          </span>
        </Button>
      </header>

      {/* Enhanced responsive warehouse utilization section */}
      <Card className="shadow-lg">
        <CardHeader className={cn(isMobile ? "p-3 pb-2" : "p-4 md:p-6 pb-4")}>
          <CardTitle className={cn(
            "flex items-center",
            isMobile ? "text-base" : "text-xl md:text-2xl"
          )}>
            <BarChartHorizontalBig className={cn(
              "mr-2 md:mr-3 text-blue-600",
              isMobile ? "h-4 w-4" : "h-5 w-5 md:h-6 md:w-6"
            )} />
            Overall Warehouse Utilization
          </CardTitle>
          <CardDescription className={cn(
            isMobile ? "text-xs" : "text-sm"
          )}>
            Summary of your entire warehouse capacity and current usage.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(
          "grid gap-3 md:gap-4",
          isMobile ? "p-3 grid-cols-1" : "p-4 md:p-6 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          <div className={cn(
            "bg-gray-50 dark:bg-gray-800 rounded-lg",
            isMobile ? "p-3" : "p-4"
          )}>
            <Label htmlFor="totalZones" className={cn(
              "font-medium text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              Total Zones
            </Label>
            <p id="totalZones" className={cn(
              "font-semibold",
              isMobile ? "text-lg" : "text-xl md:text-2xl"
            )}>
              {totalZones}
            </p>
          </div>
          <div className={cn(
            "bg-gray-50 dark:bg-gray-800 rounded-lg",
            isMobile ? "p-3" : "p-4"
          )}>
            <Label htmlFor="totalCapacity" className={cn(
              "font-medium text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              Total Capacity
            </Label>
            <p id="totalCapacity" className={cn(
              "font-semibold",
              isMobile ? "text-lg" : "text-xl md:text-2xl"
            )}>
              {totalCapacity.toLocaleString()} units
            </p>
          </div>
          <div className={cn(
            "bg-gray-50 dark:bg-gray-800 rounded-lg",
            isMobile ? "p-3" : "p-4 sm:col-span-2 lg:col-span-1"
          )}>
            <Label htmlFor="overallUtilization" className={cn(
              "font-medium text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              Overall Utilization
            </Label>
            <div className="flex items-center mt-1">
              <Progress
                value={overallUtilizationPercentage}
                className={cn(
                  "w-full mr-2 md:mr-3",
                  isMobile ? "h-2" : "h-3",
                  getUtilizationColorClass(overallUtilizationPercentage)
                )}
              />
              <span className={cn(
                "font-semibold",
                isMobile ? "text-sm" : "text-lg"
              )}>
                {overallUtilizationPercentage}%
              </span>
            </div>
            <p className={cn(
              "text-muted-foreground mt-1",
              isMobile ? "text-[10px]" : "text-xs"
            )}>
              {totalUtilized.toLocaleString()} / {totalCapacity.toLocaleString()} units used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced zones section title */}
      <div>
        <h2 className={cn(
          "font-semibold flex items-center",
          isMobile ? "text-lg" : "text-xl md:text-2xl"
        )}>
          <LayoutGrid className={cn(
            "mr-2 md:mr-3 text-green-600",
            isMobile ? "h-4 w-4" : "h-5 w-5 md:h-6 md:w-6"
          )} />
          Warehouse Zones
        </h2>
        <p className={cn(
          "text-muted-foreground",
          isMobile ? "text-xs" : "text-sm"
        )}>
          Manage individual storage zones within your warehouse.
        </p>
      </div>

      {zones.length === 0 && !isLoading ? (
        <Card className="text-center py-10 shadow-sm">
          <CardHeader>
            <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl">No Zones Found</CardTitle>
            <CardDescription>
              It looks like you haven\'t added any warehouse zones yet.
              <br />
              Get started by adding your first zone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openAddZoneDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Zone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "grid gap-3 md:gap-4 lg:gap-6",
          isMobile
            ? "grid-cols-1"
            : isTablet
            ? "grid-cols-2"
            : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}>
          {zones.map((zone) => {
            const utilization = getUtilizationPercentage(zone.utilized, zone.capacity);
            return (
              <Card key={zone.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <CardHeader className={cn(isMobile ? "p-3" : "p-4 md:p-6")}>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className={cn(
                      "font-semibold truncate",
                      isMobile ? "text-sm" : "text-lg md:text-xl"
                    )}>
                      {zone.name}
                    </CardTitle>
                    {zone.type && (
                      <span className={cn(
                        "bg-secondary text-secondary-foreground px-2 py-1 rounded-full flex-shrink-0",
                        isMobile ? "text-[10px]" : "text-xs"
                      )}>
                        {zone.type}
                      </span>
                    )}
                  </div>
                  {zone.description && (
                    <CardDescription className={cn(
                      "mt-2",
                      isMobile ? "text-xs min-h-[30px]" : "text-sm min-h-[40px]"
                    )}>
                      {zone.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className={cn(
                  "flex-grow space-y-2 md:space-y-3 pt-0",
                  isMobile ? "p-3" : "p-4 md:p-6"
                )}>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={cn(
                        "font-medium text-muted-foreground",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        Utilization:
                      </span>
                      <span className={cn(
                        "font-bold",
                        isMobile ? "text-sm" : "text-lg",
                        utilization > 85 ? 'text-red-600' : utilization > 50 ? 'text-yellow-600' : 'text-green-600'
                      )}>
                        {utilization}%
                      </span>
                    </div>
                    <Progress
                      value={utilization}
                      className={cn(
                        "rounded",
                        isMobile ? "h-2" : "h-2.5",
                        getUtilizationColorClass(utilization)
                      )}
                    />
                    <p className={cn(
                      "text-muted-foreground text-right mt-1",
                      isMobile ? "text-[10px]" : "text-xs"
                    )}>
                      {zone.utilized.toLocaleString()} / {zone.capacity.toLocaleString()} units
                    </p>
                  </div>
                </CardContent>
                <CardFooter className={cn(
                  "border-t mt-auto flex gap-2",
                  isMobile ? "p-3 pt-3 flex-col" : "p-4 md:p-6 pt-4 justify-end"
                )}>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => openEditZoneDialog(zone)}
                    className={cn(
                      "hover:bg-accent touch-target",
                      isMobile ? "w-full" : ""
                    )}
                  >
                    <Edit3 className={cn(
                      "mr-1.5",
                      isMobile ? "h-3 w-3" : "h-4 w-4"
                    )} />
                    <span className={isMobile ? "text-xs" : undefined}>Edit</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => handleDeleteZone(zone.id!)}
                    className={cn(
                      "hover:bg-destructive/90 touch-target",
                      isMobile ? "w-full" : ""
                    )}
                  >
                    <Trash2 className={cn(
                      "mr-1.5",
                      isMobile ? "h-3 w-3" : "h-4 w-4"
                    )} />
                    <span className={isMobile ? "text-xs" : undefined}>Delete</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
        <DialogContent className={cn(
          isMobile
            ? "w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] m-2 p-0 flex flex-col"
            : "sm:max-w-lg"
        )}>
          <DialogHeader className={cn(isMobile ? "p-4 pb-2 flex-shrink-0" : "")}>
            <DialogTitle className={cn(isMobile ? "text-lg" : "text-2xl")}>
              {currentZone?.id ? 'Edit Zone Details' : 'Create a New Zone'}
            </DialogTitle>
            <DialogDescription className={cn(isMobile ? "text-sm" : "")}>
              {currentZone?.id ? 'Update the information for this zone.' : 'Define a new storage area within your warehouse.'}
            </DialogDescription>
          </DialogHeader>
          <div className={cn(
            "grid gap-6 py-6 overflow-y-auto flex-1",
            isMobile ? "px-4 gap-4" : ""
          )}>
            <div className="space-y-2">
              <Label htmlFor="zone-name" className={cn(
                "font-medium",
                isMobile ? "text-sm" : "text-base"
              )}>
                Zone Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zone-name"
                value={zoneNameInput}
                onChange={(e) => setZoneNameInput(e.target.value)}
                placeholder="e.g., Aisle 5, Cold Storage Unit B"
                required
                className={cn(
                  isMobile ? "text-base p-3 h-12" : "text-base p-3 h-11"
                )}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="zone-warehouse" className="text-base font-medium">
                    Warehouse <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedWarehouseIdForNewZone?.toString()}
                    onValueChange={(value) => setSelectedWarehouseIdForNewZone(Number(value))}
                    disabled={!!currentZone?.id} // Disable if editing, warehouse change for existing zone is not simple
                >
                    <SelectTrigger className="text-base p-3 h-11">
                        <SelectValue placeholder="Select a warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                        {warehouses.map(wh => (
                            <SelectItem key={wh.id} value={wh.id!.toString()}>{wh.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {currentZone?.id && <p className="text-xs text-muted-foreground pt-1">Warehouse cannot be changed for an existing zone through this form.</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="zone-type" className="text-base font-medium">
                Zone Type (Optional)
              </Label>
              <Input
                id="zone-type"
                value={zoneTypeInput}
                onChange={(e) => setZoneTypeInput(e.target.value)}
                placeholder="e.g., Pallet Racking, Shelving, Refrigerated"
                className="text-base p-3 h-11"
              />
            </div>
            <div className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-1" : "grid-cols-2"
            )}>
                <div className="space-y-2">
                <Label htmlFor="zone-capacity" className={cn(
                  "font-medium",
                  isMobile ? "text-sm" : "text-base"
                )}>
                    Capacity (units) <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="zone-capacity"
                    type="number"
                    value={zoneCapacityInput}
                    onChange={(e) => setZoneCapacityInput(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g., 500"
                    required
                    min="0"
                    className={cn(
                      isMobile ? "text-base p-3 h-12" : "text-base p-3 h-11"
                    )}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="zone-utilized" className={cn(
                  "font-medium",
                  isMobile ? "text-sm" : "text-base"
                )}>
                    Utilized (units) <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="zone-utilized"
                    type="number"
                    value={zoneUtilizedInput}
                    onChange={(e) => setZoneUtilizedInput(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g., 250"
                    required
                    min="0"
                    className="text-base p-3 h-11"
                />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-description" className="text-base font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="zone-description"
                value={zoneDescriptionInput}
                onChange={(e) => setZoneDescriptionInput(e.target.value)}
                placeholder="Add any relevant details about this zone..."
                rows={3}
                className="text-base p-3"
              />
            </div>
          </div>
          <DialogFooter className={cn(
            "mt-2 gap-2 sm:gap-0",
            isMobile ? "p-4 pt-2 flex-shrink-0 flex-col" : ""
          )}>
            <Button
              variant="outline"
              onClick={() => setIsZoneDialogOpen(false)}
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveZone}
              disabled={isSaving || !zoneNameInput.trim() || zoneCapacityInput === '' || (currentZone === null && typeof selectedWarehouseIdForNewZone === 'undefined')}
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto"
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (currentZone?.id ? <Edit3 className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />)}
              {isSaving ? 'Saving...' : (currentZone?.id ? 'Save Changes' : 'Create Zone')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Operation Dialog */}
      <Dialog open={isStockOpDialogOpen} onOpenChange={setIsStockOpDialogOpen}>
        <DialogContent className={cn(
          isMobile
            ? "w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] m-2 p-0 flex flex-col"
            : "sm:max-w-md"
        )}>
          <DialogHeader className={cn(isMobile ? "p-4 pb-2 flex-shrink-0" : "")}>
            <DialogTitle className={cn(
              "flex items-center",
              isMobile ? "text-lg" : "text-2xl"
            )}>
              {stockOpType === 'in' ? <Download className="mr-2 h-6 w-6 text-green-600" /> : <Upload className="mr-2 h-6 w-6 text-red-600" />}
              Stock {stockOpType === 'in' ? 'In' : 'Out'} Operation
            </DialogTitle>
            <DialogDescription className={cn(isMobile ? "text-sm" : "")}>
              {stockOpType === 'in' ? 'Add items to' : 'Remove items from'} a zone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="stock-op-product">Product <span className="text-red-500">*</span></Label>
              <Select value={selectedProductForOp?.toString()} onValueChange={(value) => setSelectedProductForOp(Number(value))}>
                <SelectTrigger id="stock-op-product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id!.toString()}>{p.name} (SKU: {p.sku})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock-op-zone">Zone <span className="text-red-500">*</span></Label>
              <Select value={selectedZoneForOp?.toString()} onValueChange={(value) => setSelectedZoneForOp(Number(value))}>
                <SelectTrigger id="stock-op-zone">
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(z => (
                    <SelectItem key={z.id} value={z.id!.toString()}>{z.name} (Warehouse: {warehouses.find(w => w.id === z.warehouseId)?.name || 'N/A'})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock-op-quantity">Quantity <span className="text-red-500">*</span></Label>
              <Input
                id="stock-op-quantity"
                type="number"
                value={stockOpQuantity}
                onChange={(e) => setStockOpQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g., 10"
                min="1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock-op-reference">Reference ID (Optional)</Label>
              <Input id="stock-op-reference" value={stockOpReference} onChange={(e) => setStockOpReference(e.target.value)} placeholder="e.g., PO-123, SO-456" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock-op-notes">Notes (Optional)</Label>
              <Textarea id="stock-op-notes" value={stockOpNotes} onChange={(e) => setStockOpNotes(e.target.value)} placeholder="e.g., Urgent restock, Customer return" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockOpDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStockOperation} disabled={isStockOpSaving || !selectedProductForOp || !selectedZoneForOp || stockOpQuantity === '' || Number(stockOpQuantity) <= 0}>
              {isStockOpSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (stockOpType === 'in' ? <Download className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />)}
              Confirm Stock {stockOpType === 'in' ? 'In' : 'Out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      {/* Ensure products, zones, and warehouses are loaded or are at least empty arrays */}
      <FloatingActionButton
        products={products || []}
        zones={zones || []}
        warehouses={warehouses || []}
        onStockOperationComplete={loadInitialData} // Pass the function to refetch data
      />
    </RContainer>
  );
}
