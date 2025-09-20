"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronUp, LogIn, LogOut, Plus, ScanBarcode, Camera, X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/i18n-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { stockInOperation, stockOutOperation, Product, Zone, Warehouse } from "@/lib/db";
import { ChatInterface } from "@/components/chat-interface";

export interface FloatingActionButtonProps {
  products: Product[];
  zones: Zone[];
  warehouses: Warehouse[];
  onStockOperationComplete: () => void;
}

interface FabActionDefinition {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  onClick?: () => void;
}

export function FloatingActionButton({
  products,
  zones,
  warehouses,
  onStockOperationComplete
}: FloatingActionButtonProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const internalActions: FabActionDefinition[] = [
    {
      id: "ai-assistant",
      label: t("floatingActions.aiAssistant") || "AI Assistant",
      icon: Bot,
      color: "bg-purple-600 hover:bg-purple-700 text-white",
      description: t("floatingActions.aiAssistantDesc") || "Get help from AI",
      onClick: () => {
        setIsChatOpen(true);
        setIsChatMinimized(false);
      }
    },
    {
      id: "barcode-scan",
      label: t("floatingActions.scanBarcode") || "Scan Barcode",
      icon: ScanBarcode,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      description: t("floatingActions.scanBarcodeDesc") || "Scan product barcode",
    },
    {
      id: "item-recognition",
      label: t("floatingActions.recognizeItem") || "Recognize Item",
      icon: Camera,
      color: "bg-indigo-600 hover:bg-indigo-700 text-white",
      description: t("floatingActions.recognizeItemDesc") || "Identify product with camera",
    },
    {
      id: "stock-in",
      label: t("floatingActions.stockIn") || "Stock In",
      icon: LogIn,
      color: "bg-green-600 hover:bg-green-700 text-white",
      description: t("floatingActions.stockInDesc") || "Record incoming inventory",
    },
    {
      id: "stock-out",
      label: t("floatingActions.stockOut") || "Stock Out",
      icon: LogOut,
      color: "bg-amber-600 hover:bg-amber-700 text-white",
      description: t("floatingActions.stockOutDesc") || "Record outgoing inventory",
    },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>();
  const [quantity, setQuantity] = useState<string>("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [scanResult, setScanResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any | null>(null); // Type for recognitionResult
  const [isRecognizing, setIsRecognizing] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null); // Type for buttonRef

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleActionClick = (actionId: string) => {
    // Check if it's the AI assistant action
    if (actionId === "ai-assistant") {
      // This will be handled by the onClick in the action definition
      setIsOpen(false);
      return;
    }

    setActiveDialog(actionId);
    setIsOpen(false);

    if (actionId === "stock-in" || actionId === "stock-out") {
      setSelectedProductId(products.length > 0 ? products[0].id : undefined);
      setSelectedZoneId(zones.length > 0 ? zones[0].id : undefined);
      setQuantity("");
      setReference("");
      setNotes("");
      setIsSubmitting(false);
    }
  };

  const handleStockSubmit = async () => {
    if (!selectedProductId || !selectedZoneId || !quantity || Number(quantity) <= 0) {
      toast({
        title: t("errors.validationError") || "Validation Error",
        description: t("errors.selectProductZoneQuantity") || "Please select product, zone, and enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const quantityValue = Number(quantity);
    const targetZone = zones.find(z => z.id === selectedZoneId);

    if (!targetZone || typeof targetZone.warehouseId !== 'number') {
      toast({
        title: t("errors.error") || "Error",
        description: t("errors.invalidZoneOrWarehouse") || "Selected zone or its warehouse ID is invalid.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (activeDialog === "stock-in") {
        await stockInOperation(selectedProductId, quantityValue, targetZone.warehouseId, selectedZoneId, {
          referenceId: reference,
          notes: notes,
        });
        toast({
          title: t("messages.stockInSuccess") || "Stock In Successful",
          description: `${quantityValue} ${products.find(p=>p.id === selectedProductId)?.name || 'items'} ${t("messages.addedToZone")} ${targetZone.name}.`
        });
      } else if (activeDialog === "stock-out") {
        await stockOutOperation(selectedProductId, quantityValue, targetZone.warehouseId, selectedZoneId, {
          referenceId: reference,
          notes: notes,
        });
        toast({
          title: t("messages.stockOutSuccess") || "Stock Out Successful",
          description: `${quantityValue} ${products.find(p=>p.id === selectedProductId)?.name || 'items'} ${t("messages.removedFromZone")} ${targetZone.name}.`
        });
      }
      onStockOperationComplete();
      setActiveDialog(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("errors.stockOperationFailed") || "Stock operation failed.";
      toast({
        title: t("errors.error") || "Operation Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ensure placeholder texts have fallbacks
  const enterBarcodeManuallyPlaceholder = t("floatingActions.enterBarcodeManually") || "Enter barcode manually...";
  const referenceStockInPlaceholder = t("floatingActions.referenceStockInPlaceholder") || "PO number, invoice, etc.";
  const referenceStockOutPlaceholder =
    t("floatingActions.referenceStockOutPlaceholder") || "Order number, requisition, etc.";

  return (
    <>
      <div className="fixed bottom-20 md:bottom-8 right-8 z-50" ref={buttonRef}>
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-2 items-end mb-2">
              {internalActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <div className="bg-white shadow-md rounded-md px-2 py-1 text-sm font-medium">{action.label}</div>
                  <Button
                    size="icon"
                    className={cn("rounded-full shadow-lg", action.color)}
                    onClick={action.onClick || (() => handleActionClick(action.id))}
                    aria-label={action.label}
                  >
                    <action.icon className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-transform",
            isOpen ? "bg-gray-700 rotate-45" : "bg-primary",
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? t("floatingActions.closeMenu") || "Close menu" : t("floatingActions.openMenu") || "Open menu"}
        >
          {isOpen ? <ChevronUp className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        isMinimized={isChatMinimized}
        onClose={() => setIsChatOpen(false)}
        onMinimize={() => setIsChatMinimized(!isChatMinimized)}
      />

      {/* Stock In Dialog */}
      <Dialog open={activeDialog === "stock-in"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[425px] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("floatingActions.stockIn") || "Stock In"}</DialogTitle>
            <DialogDescription>
              {t("floatingActions.stockInDesc") || "Record incoming inventory items."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product-stock-in" className="text-right">
                {t("inventory.productName") || "Product"}
              </Label>
              <Select
                value={selectedProductId?.toString()}
                onValueChange={(value) => setSelectedProductId(Number(value))}
              >
                <SelectTrigger id="product-stock-in" className="col-span-3">
                  <SelectValue placeholder={t("placeholders.selectProduct") || "Select a product"} />
                </SelectTrigger>
                <SelectContent>
                  {(products || []).map(p => (
                    <SelectItem key={p.id} value={p.id!.toString()}>{p.name} (SKU: {p.sku})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zone-stock-in" className="text-right">
                {t("inventory.zone") || "Zone"}
              </Label>
              <Select
                value={selectedZoneId?.toString()}
                onValueChange={(value) => setSelectedZoneId(Number(value))}
              >
                <SelectTrigger id="zone-stock-in" className="col-span-3">
                  <SelectValue placeholder={t("placeholders.selectZone") || "Select a zone"} />
                </SelectTrigger>
                <SelectContent>
                  {(zones || []).map(z => {
                    const warehouse = (warehouses || []).find(w => w.id === z.warehouseId);
                    return (
                      <SelectItem key={z.id} value={z.id!.toString()}>
                        {z.name} ({(warehouse?.name || t("common.unknownWarehouse"))})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity-stock-in" className="text-right">
                {t("inventory.stock") || "Quantity"}
              </Label>
              <Input
                id="quantity-stock-in"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 10"
                min="1"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference-stock-in" className="text-right">
                {t("common.reference") || "Reference"}
              </Label>
              <Input
                id="reference-stock-in"
                placeholder={referenceStockInPlaceholder}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes-stock-in" className="text-right">
                {t("common.notes") || "Notes"}
              </Label>
              <Textarea
                id="notes-stock-in"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder={t("placeholders.optionalNotes") || "Optional notes..."}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)} disabled={isSubmitting}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleStockSubmit} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("floatingActions.stockIn") || "Record Stock In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Out Dialog */}
      <Dialog open={activeDialog === "stock-out"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[425px] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("floatingActions.stockOut") || "Stock Out"}</DialogTitle>
            <DialogDescription>
              {t("floatingActions.stockOutDesc") || "Record outgoing inventory items."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product-stock-out" className="text-right">
                {t("inventory.productName") || "Product"}
              </Label>
              <Select
                value={selectedProductId?.toString()}
                onValueChange={(value) => setSelectedProductId(Number(value))}
              >
                <SelectTrigger id="product-stock-out" className="col-span-3">
                  <SelectValue placeholder={t("placeholders.selectProduct") || "Select a product"} />
                </SelectTrigger>
                <SelectContent>
                  {(products || []).map(p => (
                    <SelectItem key={p.id} value={p.id!.toString()}>{p.name} (SKU: {p.sku})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zone-stock-out" className="text-right">
                {t("inventory.zone") || "Zone"}
              </Label>
              <Select
                value={selectedZoneId?.toString()}
                onValueChange={(value) => setSelectedZoneId(Number(value))}
              >
                <SelectTrigger id="zone-stock-out" className="col-span-3">
                  <SelectValue placeholder={t("placeholders.selectZone") || "Select a zone"} />
                </SelectTrigger>
                <SelectContent>
                  {(zones || []).map(z => {
                    const warehouse = (warehouses || []).find(w => w.id === z.warehouseId);
                    return (
                      <SelectItem key={z.id} value={z.id!.toString()}>
                        {z.name} ({warehouse?.name || t("common.unknownWarehouse")})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity-stock-out" className="text-right">
                {t("inventory.stock") || "Quantity"}
              </Label>
              <Input
                id="quantity-stock-out"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 5"
                min="1"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference-stock-out" className="text-right">
                {t("common.reference") || "Reference"}
              </Label>
              <Input
                id="reference-stock-out"
                placeholder={referenceStockOutPlaceholder}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes-stock-out" className="text-right">
                {t("common.notes") || "Notes"}
              </Label>
              <Textarea
                id="notes-stock-out"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder={t("placeholders.optionalNotes") || "Optional notes..."}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)} disabled={isSubmitting}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleStockSubmit} className="bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("floatingActions.stockOut") || "Record Stock Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={activeDialog === "barcode-scan"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("floatingActions.scanBarcode") || "Barcode Scanner"}</DialogTitle>
            <DialogDescription>
              {t("floatingActions.scanBarcodeDesc") || "Scan a product barcode to quickly find or add inventory items."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isScanning ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-full h-[200px] bg-gray-100 rounded-md overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* This would be a camera feed in a real app */}
                    <div className="w-full h-1 bg-red-500 animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 border-2 border-dashed border-primary rounded-md"></div>
                </div>
                <Button variant="outline" onClick={() => setIsScanning(false)}>
                  <X className="mr-2 h-4 w-4" />
                  {t("floatingActions.cancelScan") || "Cancel Scan"}
                </Button>
              </div>
            ) : scanResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-medium text-green-800">
                    {t("floatingActions.barcodeDetected") || "Barcode Detected!"}
                  </h3>
                  <p className="text-sm text-green-700">
                    {t("inventory.productName") || "Product"}: Wireless Headphones
                  </p>
                  <p className="text-sm text-green-700">{t("inventory.sku") || "SKU"}: WH-001</p>
                  <p className="text-sm text-green-700">
                    {t("common.barcode") || "Barcode"}: {scanResult}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => setActiveDialog("stock-in")}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("floatingActions.stockInItem") || "Stock In This Item"}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveDialog("stock-out")}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("floatingActions.stockOutItem") || "Stock Out This Item"}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveDialog(null)}>
                    {t("floatingActions.viewItemDetails") || "View Item Details"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input placeholder={enterBarcodeManuallyPlaceholder} className="flex-1" />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setIsScanning(true)
                      // Simulate a scan after 3 seconds
                      setTimeout(() => {
                        setIsScanning(false)
                        setScanResult("978020137962")
                      }, 3000)
                    }}
                  >
                    <ScanBarcode className="mr-2 h-4 w-4" />
                    {t("floatingActions.startScanning") || "Start Scanning"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActiveDialog(null)
                setScanResult("")
                setIsScanning(false)
              }}
            >
              {t("common.close") || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Recognition Dialog */}
      <Dialog open={activeDialog === "item-recognition"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("floatingActions.recognizeItem") || "Item Recognition"}</DialogTitle>
            <DialogDescription>
              {t("floatingActions.recognizeItemDesc") || "Use your camera to identify products automatically."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isRecognizing ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-full h-[200px] bg-gray-100 rounded-md overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* This would be a camera feed in a real app */}
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                  <div className="absolute inset-0 border-2 border-dashed border-primary rounded-md"></div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {t("floatingActions.analyzingImage") || "Analyzing image..."}
                </p>
                <Button variant="outline" onClick={() => setIsRecognizing(false)}>
                  <X className="mr-2 h-4 w-4" />
                  {t("common.cancel") || "Cancel"}
                </Button>
              </div>
            ) : recognitionResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-blue-800">
                    {t("floatingActions.productIdentified") || "Product Identified!"}
                  </h3>
                  <p className="text-sm text-blue-700">{t("inventory.productName") || "Product"}: Bluetooth Speaker</p>
                  <p className="text-sm text-blue-700">{t("inventory.sku") || "SKU"}: BS-004</p>
                  <p className="text-sm text-blue-700">{t("inventory.category") || "Category"}: Electronics</p>
                  <p className="text-sm text-blue-700">{t("floatingActions.confidence") || "Confidence"}: 94%</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => setActiveDialog("stock-in")}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("floatingActions.stockInItem") || "Stock In This Item"}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveDialog("stock-out")}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("floatingActions.stockOutItem") || "Stock Out This Item"}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveDialog(null)}>
                    {t("floatingActions.viewItemDetails") || "View Item Details"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-full max-w-[300px] h-[200px] bg-gray-100 rounded-md flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setIsRecognizing(true)
                      // Simulate recognition after 3 seconds
                      setTimeout(() => {
                        setIsRecognizing(false)
                        setRecognitionResult({
                          product: "Bluetooth Speaker",
                          sku: "BS-004",
                          category: "Electronics",
                          confidence: 94,
                        })
                      }, 3000)
                    }}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {t("floatingActions.takePhoto") || "Take Photo"}
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {t("floatingActions.positionItemCenter") ||
                    "Position the item in the center of the frame for best results"}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActiveDialog(null)
                setRecognitionResult(null)
                setIsRecognizing(false)
              }}
            >
              {t("common.close") || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
