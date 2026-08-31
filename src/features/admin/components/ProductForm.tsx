"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { Product } from "@/features/products/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X, Upload, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

const variantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  sku: z.string().min(3, "SKU must be at least 3 chars"),
  price: z.coerce.number().positive("Must be > 0"),
  stock: z.coerce.number().int().nonnegative("Must be >= 0"),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal("")),
});

const imageSchema = z.object({
  url: z.string().url(),
  altText: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 chars"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be > 0"),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]).optional().or(z.literal("")),
  material: z.string().optional(),
  brand: z.string().optional(),
  collection: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  variants: z.array(variantSchema).min(1, "At least one variant required"),
  images: z.array(imageSchema).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      gender: (initialData?.gender as any) || "",
      material: initialData?.material || "",
      brand: initialData?.brand || "",
      collection: initialData?.collection || "",
      categoryId: initialData?.categoryId || "",
      variants: initialData?.variants?.map(v => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        compareAtPrice: v.compareAtPrice || "",
      })) || [{ size: "", color: "", sku: "", price: 0, stock: 0, compareAtPrice: "" }],
      images: initialData?.images?.map(img => ({
        url: img.url,
        altText: img.altText || "",
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })) || [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const createMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormValues) =>
      productsApi.updateProduct({ id: initialData!.id, data }),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "product", initialData!.id] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update product");
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    // Clean up empty optional fields
    const cleanedValues = {
      ...values,
      gender: values.gender === "" ? undefined : values.gender,
      variants: values.variants.map(v => ({
        ...v,
        compareAtPrice: v.compareAtPrice === "" ? undefined : v.compareAtPrice,
      })),
    };

    if (initialData) {
      updateMutation.mutate(cleanedValues as any);
    } else {
      createMutation.mutate(cleanedValues as any);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await productsApi.uploadImage(file);
      appendImage({
        url,
        altText: "",
        sortOrder: imageFields.length,
        isPrimary: imageFields.length === 0,
      });
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-xl font-bold tracking-tight mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
            <Input {...form.register("name")} placeholder="Product Name" />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category <span className="text-destructive">*</span></label>
            <select 
              {...form.register("categoryId")}
              className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a category</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {form.formState.errors.categoryId && <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Base Price <span className="text-destructive">*</span></label>
            <Input type="number" step="0.01" {...form.register("price")} placeholder="0.00" />
            {form.formState.errors.price && <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gender</label>
            <select 
              {...form.register("gender")}
              className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Not specified</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="KIDS">Kids</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              {...form.register("description")} 
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Product description..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Material</label>
            <Input {...form.register("material")} placeholder="e.g. 100% Cotton" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <Input {...form.register("brand")} placeholder="e.g. Nike" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Collection</label>
            <Input {...form.register("collection")} placeholder="e.g. Summer 2024" />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold tracking-tight">Images</h2>
          <div>
            <input 
              type="file" 
              id="image-upload" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <label htmlFor="image-upload">
              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer">
                {uploading ? "Uploading..." : <><Upload className="w-4 h-4 mr-2" /> Upload Image</>}
              </span>
            </label>
          </div>
        </div>

        {imageFields.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
            No images added yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {imageFields.map((field, index) => (
              <div key={field.id} className="relative group border border-border rounded-lg overflow-hidden aspect-square bg-muted/20">
                <img src={field.url} alt="Preview" className="w-full h-full object-cover" />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {form.watch(`images.${index}.isPrimary`) && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow">
                    <CheckCircle className="w-3 h-3" /> Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold tracking-tight">Variants</h2>
          <Button type="button" onClick={() => appendVariant({ size: "", color: "", sku: "", price: Number(form.getValues("price")) || 0, stock: 0, compareAtPrice: "" })} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Variant
          </Button>
        </div>

        {form.formState.errors.variants?.root && (
          <p className="text-sm text-destructive mb-4">{form.formState.errors.variants.root.message}</p>
        )}

        <div className="space-y-4">
          {variantFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border border-border rounded-lg bg-muted/5 relative">
              <div className="absolute -top-3 -right-3">
                <Button type="button" variant="destructive" size="icon" className="w-6 h-6 rounded-full shadow" onClick={() => removeVariant(index)} disabled={variantFields.length === 1}>
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Size *</label>
                <Input {...form.register(`variants.${index}.size`)} placeholder="e.g. M" className="h-8 text-sm" />
                {form.formState.errors.variants?.[index]?.size && <p className="text-[10px] text-destructive">{form.formState.errors.variants[index]?.size?.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Color *</label>
                <Input {...form.register(`variants.${index}.color`)} placeholder="e.g. Red" className="h-8 text-sm" />
                {form.formState.errors.variants?.[index]?.color && <p className="text-[10px] text-destructive">{form.formState.errors.variants[index]?.color?.message}</p>}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium">SKU *</label>
                <Input {...form.register(`variants.${index}.sku`)} placeholder="Unique SKU" className="h-8 text-sm" />
                {form.formState.errors.variants?.[index]?.sku && <p className="text-[10px] text-destructive">{form.formState.errors.variants[index]?.sku?.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Price *</label>
                <Input type="number" step="0.01" {...form.register(`variants.${index}.price`)} placeholder="0.00" className="h-8 text-sm" />
                {form.formState.errors.variants?.[index]?.price && <p className="text-[10px] text-destructive">{form.formState.errors.variants[index]?.price?.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Stock *</label>
                <Input type="number" {...form.register(`variants.${index}.stock`)} placeholder="0" className="h-8 text-sm" />
                {form.formState.errors.variants?.[index]?.stock && <p className="text-[10px] text-destructive">{form.formState.errors.variants[index]?.stock?.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Compare At</label>
                <Input type="number" step="0.01" {...form.register(`variants.${index}.compareAtPrice`)} placeholder="0.00" className="h-8 text-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} size="lg">
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Saving..." : initialData ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
