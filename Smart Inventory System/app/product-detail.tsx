"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Package, ShoppingCart, Truck } from "lucide-react"

export default function ProductDetailPage({ product, onEdit }) {
  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No product selected</p>
      </div>
    )
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "In Stock":
        return "default"
      case "Low Stock":
        return "warning"
      case "Out of Stock":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Sample transaction history
  const transactions = [
    { id: 1, date: "2023-05-10", type: "Purchase", quantity: 20, reference: "PO-2023-001" },
    { id: 2, date: "2023-05-15", type: "Sale", quantity: 5, reference: "SO-2023-042" },
    { id: 3, date: "2023-05-22", type: "Sale", quantity: 3, reference: "SO-2023-051" },
    { id: 4, date: "2023-06-01", type: "Purchase", quantity: 15, reference: "PO-2023-008" },
    { id: 5, date: "2023-06-10", type: "Sale", quantity: 7, reference: "SO-2023-067" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="outline" size="sm" className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <Button onClick={() => onEdit(product)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle>{product.name}</CardTitle>
              <Badge variant={getStatusBadgeVariant(product.status)}>{product.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">SKU</h3>
                  <p>{product.sku}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                  <p>{product.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Price</h3>
                  <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Stock</h3>
                  <p className="text-lg font-semibold">{product.stock} units</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Reorder Point</h3>
                  <p>10 units</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                  <p>Warehouse A, Shelf B3</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-sm">
                This is a high-quality {product.name.toLowerCase()} that offers excellent performance and durability.
                Perfect for everyday use, this product has been one of our best sellers in the {product.category}{" "}
                category.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create Sales Order
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Truck className="mr-2 h-4 w-4" />
              Create Purchase Order
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Adjust Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transactions">
            <TabsList className="mb-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="price-history">Price History</TabsTrigger>
              <TabsTrigger value="stock-history">Stock History</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              <div className="rounded-md border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge variant={transaction.type === "Purchase" ? "outline" : "secondary"}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.type === "Purchase" ? "+" : "-"}
                          {transaction.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="price-history">
              <div className="p-4 text-center text-muted-foreground">Price history chart will be displayed here</div>
            </TabsContent>

            <TabsContent value="stock-history">
              <div className="p-4 text-center text-muted-foreground">Stock history chart will be displayed here</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
