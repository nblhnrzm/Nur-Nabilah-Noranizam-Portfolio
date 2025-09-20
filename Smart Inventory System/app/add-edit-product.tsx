"use client";

import { useEffect, useState, useRef } from "react"; // Added useRef
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, type Product, type Category } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Save, Camera, Upload } from "lucide-react"; // Added Camera, Upload
import { useResponsive } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  costPrice: z.coerce.number().optional(),
  reorderPoint: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  imageUrl: z.string().optional(),
  // tags: z.array(z.string()).optional(), // For future use
  // barcode: z.string().optional(), // For future use
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddEditProductProps {
  productId?: number; // If provided, it's an edit operation
  onSave?: () => void; // Callback after saving
  onCancel?: () => void; // Callback for cancelling
  categories?: Category[]; // 添加分类列表属性
  onProductAddedOrUpdated?: () => void; // 添加产品添加或更新后的回调
}

export default function AddEditProductPage({ productId, onSave, onCancel, categories: initialCategories, onProductAddedOrUpdated }: AddEditProductProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isMobile, isTablet } = useResponsive();
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch, // Added watch
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      costPrice: undefined,
      reorderPoint: undefined,
      categoryId: undefined,
      imageUrl: "",
    },
  });

  const currentImageUrl = watch("imageUrl");

  useEffect(() => {
    setIsEditing(!!productId);
    fetchCategories();
    if (productId) {
      fetchProductData(productId);
    } else {
      // For new products, if there's an initial imageUrl (e.g. from a previous attempt), show it.
      if (currentImageUrl) {
        setImagePreview(currentImageUrl);
      }
    }
  }, [productId]);

  useEffect(() => {
    // Update preview if imageUrl changes (e.g. by form reset or direct setValue)
    if (currentImageUrl) {
      setImagePreview(currentImageUrl);
    } else {
      setImagePreview(null);
    }
  }, [currentImageUrl]);

  const fetchCategories = async () => {
    try {
      const allCategories = await db.categories.toArray();
      setCategories(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({ title: "Error", description: "Could not fetch categories.", variant: "destructive" });
    }
  };

  const fetchProductData = async (id: number) => {
    setIsLoading(true);
    try {
      const product = await db.products.get(id);
      if (product) {
        reset({
          name: product.name,
          sku: product.sku,
          description: product.description || "",
          price: product.price,
          costPrice: product.costPrice,
          reorderPoint: product.reorderPoint,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl || "",
        });
        if (product.imageUrl) {
          setImagePreview(product.imageUrl);
        }
      } else {
        toast({ title: "Error", description: "Product not found.", variant: "destructive" });
        if (onCancel) onCancel(); else router.push("/inventory"); // Redirect if product not found
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({ title: "Error", description: "Could not fetch product data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: number; createdAt?: Date; updatedAt?: Date } = {
        ...data,
        price: Number(data.price),
        costPrice: data.costPrice ? Number(data.costPrice) : undefined,
        reorderPoint: data.reorderPoint ? Number(data.reorderPoint) : undefined,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
        imageUrl: data.imageUrl || undefined, // Ensure undefined if empty string for DB
        // images and tags can be added here later
      };

      if (isEditing && productId) {
        await db.products.update(productId, { ...productData, updatedAt: new Date() });
        toast({ title: "Success", description: "Product updated successfully." });
      } else {
        await db.products.add({ ...productData, createdAt: new Date(), updatedAt: new Date() } as Product);
        toast({ title: "Success", description: "Product added successfully." });
      }
      reset(); // Reset form after submission
      if (onSave) onSave(); else router.push("/inventory"); // Redirect or call callback
      if (onProductAddedOrUpdated) onProductAddedOrUpdated(); // Call the new callback
    } catch (error) {
      console.error("Error saving product:", error);
      toast({ title: "Error", description: "Could not save product.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // A simple way to add a new category - in a real app, this might be a modal or separate form
  const handleAddNewCategory = async () => {
    const newCategoryName = prompt("Enter new category name:");
    if (newCategoryName && newCategoryName.trim() !== "") {
      try {
        const existingCategory = await db.categories.where('name').equalsIgnoreCase(newCategoryName.trim()).first();
        if (existingCategory) {
          toast({ title: "Info", description: "Category already exists.", variant: "default" });
          setValue("categoryId", existingCategory.id); // Set the value to existing category
          return;
        }
        const newCategoryId = await db.categories.add({ name: newCategoryName.trim() });
        await fetchCategories(); // Refresh category list
        setValue("categoryId", newCategoryId as number); // Set the new category as selected
        toast({ title: "Success", description: "Category added." });
      } catch (error) {
        console.error("Error adding category:", error);
        toast({ title: "Error", description: "Could not add category.", variant: "destructive" });
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setValue("imageUrl", dataUrl, { shouldValidate: true });
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value to allow selecting the same file again if needed
    event.target.value = "";
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraDialog = () => {
    cameraInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setValue("imageUrl", "", { shouldValidate: true });
    setImagePreview(null);
  };

  return (
    <Card className={cn(
      "w-full",
      isMobile ? "mx-0 border-0 shadow-none" : "max-w-2xl mx-auto"
    )}>
      <CardHeader className={cn(isMobile ? "p-0 pb-4" : "")}>
        <CardTitle className={cn(isMobile ? "text-lg" : "")}>
          {isEditing ? "Edit Product" : "Add New Product"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className={cn(
          "space-y-6",
          isMobile ? "p-0 space-y-4" : ""
        )}>
          <div className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 md:grid-cols-2"
          )}>
            <div>
              <Label htmlFor="name" className={cn(isMobile ? "text-sm font-medium" : "")}>
                Product Name
              </Label>
              <Input
                id="name"
                {...register("name")}
                disabled={isLoading}
                className={cn(isMobile ? "h-12 text-base" : "")}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="sku" className={cn(isMobile ? "text-sm font-medium" : "")}>
                SKU (Stock Keeping Unit)
              </Label>
              <Input
                id="sku"
                {...register("sku")}
                disabled={isLoading}
                className={cn(isMobile ? "h-12 text-base" : "")}
              />
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className={cn(isMobile ? "text-sm font-medium" : "")}>
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              disabled={isLoading}
              className={cn(isMobile ? "text-base" : "")}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 md:grid-cols-2"
          )}>
            <div>
              <Label htmlFor="price" className={cn(isMobile ? "text-sm font-medium" : "")}>
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price")}
                disabled={isLoading}
                className={cn(isMobile ? "h-12 text-base" : "")}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <Label htmlFor="costPrice" className={cn(isMobile ? "text-sm font-medium" : "")}>
                Cost Price (Optional)
              </Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                {...register("costPrice")}
                disabled={isLoading}
                className={cn(isMobile ? "h-12 text-base" : "")}
              />
              {errors.costPrice && <p className="text-red-500 text-sm mt-1">{errors.costPrice.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() ?? "_none_"} // Ensure Select gets a valid string if field.value is undefined
                    onValueChange={(value) => field.onChange(value === "_none_" ? undefined : parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">No Category</SelectItem> {/* Changed value from "" */}
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id!.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
            </div>
             <div>
                <Button type="button" variant="outline" onClick={handleAddNewCategory} disabled={isLoading} className="w-full md:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="reorderPoint">Reorder Point (Optional)</Label>
            <Input id="reorderPoint" type="number" {...register("reorderPoint")} disabled={isLoading} />
            {errors.reorderPoint && <p className="text-red-500 text-sm mt-1">{errors.reorderPoint.message}</p>}
          </div>

          <div>
            <Label htmlFor="productImage">Product Image</Label>
            <div className="mt-2 flex flex-col items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Product Preview" className="h-40 w-40 rounded-md object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="h-40 w-40 rounded-md bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">No Image</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={triggerCameraDialog} disabled={isLoading}>
                  <Camera className="mr-2 h-4 w-4" /> Take Picture
                </Button>
                <Button type="button" variant="outline" onClick={triggerFileDialog} disabled={isLoading}>
                  <Upload className="mr-2 h-4 w-4" /> Upload File
                </Button>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment" // For rear camera, use "user" for front
                ref={cameraInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>}
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Add Product"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
