"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { Product } from "@/features/products/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Combobox } from "@/components/ui/combobox";
import { Plus, Trash2, X, Upload, CheckCircle, Loader2, Link as LinkIcon, GripVertical, Info, Image as ImageIcon, Layers, CheckCircle2 } from "lucide-react";
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

interface ProductOption {
  name: string;
  values: string[];
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [activeSection, setActiveSection] = useState("basic-info");
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [isDragOverZone, setIsDragOverZone] = useState(false);

  const [options, setOptions] = useState<ProductOption[]>([
    { name: "Size", values: [] },
    { name: "Color", values: [] }
  ]);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});
  
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [bulkCompareAt, setBulkCompareAt] = useState("");

  const sectionRefs = {
    "basic-info": useRef<HTMLDivElement>(null),
    "media": useRef<HTMLDivElement>(null),
    "variants": useRef<HTMLDivElement>(null),
  };

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
  });

  const categoryOptions = categories?.map(c => ({
    label: c.name,
    value: c.id
  })) || [];

  const { data: productsData } = useQuery({
    queryKey: ["products", "autocomplete"],
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  });

  const allProducts = productsData?.data || [];
  const brandOptions = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean) as string[]));
  const materialOptions = Array.from(new Set(allProducts.map(p => p.material).filter(Boolean) as string[]));
  const collectionOptions = Array.from(new Set(allProducts.map(p => p.collection).filter(Boolean) as string[]));

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

  const { fields: variantFields, append: appendVariant, remove: removeVariant, replace: replaceVariants } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage, move: moveImage, replace: replaceImages } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const formValues = form.watch();
  const isBasicInfoComplete = !!formValues.name && !!formValues.categoryId && !!formValues.price;
  const isMediaComplete = imageFields.length > 0;
  const isVariantsComplete = variantFields.length > 0 && variantFields.every(v => v.size && v.color && v.sku && v.price > 0 && v.stock >= 0);

  useEffect(() => {
    const handleScroll = () => {
      let current = activeSection;
      const scrollPosition = window.scrollY + 150; 
      
      Object.entries(sectionRefs).forEach(([key, ref]) => {
        if (ref.current && ref.current.offsetTop <= scrollPosition) {
          current = key;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

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
    const cleanedValues = {
      ...values,
      gender: values.gender === "" ? undefined : values.gender,
      variants: values.variants.map((v, idx) => ({
        ...v,
        sku: v.sku || `SKU-${idx}-${Date.now()}`,
        compareAtPrice: v.compareAtPrice === "" ? undefined : v.compareAtPrice,
      })),
      images: values.images?.map((img, idx) => ({
        ...img,
        sortOrder: idx
      }))
    };

    if (initialData) {
      updateMutation.mutate(cleanedValues as any);
    } else {
      createMutation.mutate(cleanedValues as any);
    }
  };

  const scrollToSection = (id: string) => {
    sectionRefs[id as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processUploadFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => productsApi.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      urls.forEach(url => {
        appendImage({
          url,
          altText: "",
          sortOrder: imageFields.length,
          isPrimary: imageFields.length === 0,
        });
      });
      toast.success(`${urls.length} image(s) uploaded!`);
    } catch (error) {
      toast.error("Failed to upload image(s)");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processUploadFiles(e.target.files);
    e.target.value = "";
  };

  const handleDropZoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverZone(false);
    if (e.dataTransfer.files) processUploadFiles(e.dataTransfer.files);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput) return;
    try {
      new URL(imageUrlInput);
      appendImage({
        url: imageUrlInput,
        altText: "",
        sortOrder: imageFields.length,
        isPrimary: imageFields.length === 0,
      });
      setImageUrlInput("");
      toast.success("Image URL added!");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const setPrimaryImage = (index: number) => {
    const newImages = imageFields.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    replaceImages(newImages);
  };

  const handleDragStart = (index: number) => setDraggedImageIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;
    moveImage(draggedImageIndex, index);
    setDraggedImageIndex(index);
  };
  const handleDragEnd = () => setDraggedImageIndex(null);

  const generateVariants = () => {
    const sizeOpt = options.find(o => o.name === "Size")?.values || [];
    const colorOpt = options.find(o => o.name === "Color")?.values || [];
    
    if (sizeOpt.length === 0 && colorOpt.length === 0) return;

    let combinations: { size: string, color: string }[] = [];
    
    if (sizeOpt.length > 0 && colorOpt.length > 0) {
      sizeOpt.forEach(s => colorOpt.forEach(c => combinations.push({ size: s, color: c })));
    } else if (sizeOpt.length > 0) {
      sizeOpt.forEach(s => combinations.push({ size: s, color: "" }));
    } else if (colorOpt.length > 0) {
      colorOpt.forEach(c => combinations.push({ size: "", color: c }));
    }

    const currentVariants = form.getValues("variants");
    const basePrice = form.getValues("price") || 0;

    const newVariants = combinations.map(combo => {
      const existing = currentVariants.find(v => v.size === combo.size && v.color === combo.color);
      if (existing) return existing;
      
      const labelParts = [combo.size, combo.color].filter(Boolean);
      return {
        size: combo.size,
        color: combo.color,
        sku: `SKU-${labelParts.join('-').toUpperCase()}`,
        price: Number(basePrice),
        stock: 0,
        compareAtPrice: ""
      };
    });

    replaceVariants(newVariants);
  };

  const addOptionValue = (index: number, val: string) => {
    if (!val.trim()) return;
    const newOptions = [...options];
    if (!newOptions[index].values.includes(val.trim())) {
      newOptions[index].values.push(val.trim());
      setOptions(newOptions);
      setNewOptionValues({ ...newOptionValues, [index]: "" });
      setTimeout(generateVariants, 0);
    }
  };

  const removeOptionValue = (optIndex: number, valIndex: number) => {
    const newOptions = [...options];
    newOptions[optIndex].values.splice(valIndex, 1);
    setOptions(newOptions);
    setTimeout(generateVariants, 0);
  };

  const handleBulkEdit = () => {
    const currentVariants = form.getValues("variants");
    const newVariants = currentVariants.map(v => ({
      ...v,
      price: bulkPrice ? Number(bulkPrice) : v.price,
      stock: bulkStock ? Number(bulkStock) : v.stock,
      compareAtPrice: bulkCompareAt ? Number(bulkCompareAt) : v.compareAtPrice,
    }));
    replaceVariants(newVariants);
    setBulkPrice("");
    setBulkStock("");
    setBulkCompareAt("");
    toast.success("Bulk edit applied!");
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-[1400px] mx-auto pb-24 relative items-start">
      {/* Sticky Left Nav */}
      <div className="hidden md:block w-56 sticky top-6 self-start">
        <nav className="space-y-1">
          <button 
            onClick={() => scrollToSection("basic-info")}
            className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-r-lg text-sm font-medium transition-colors border-l-4 ${activeSection === "basic-info" ? "bg-primary/10 text-primary border-primary" : "text-muted-foreground hover:bg-muted border-transparent"}`}
          >
            <Info className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Basic Info</span>
            {isBasicInfoComplete && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
          </button>
          <button 
            onClick={() => scrollToSection("media")}
            className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-r-lg text-sm font-medium transition-colors border-l-4 ${activeSection === "media" ? "bg-primary/10 text-primary border-primary" : "text-muted-foreground hover:bg-muted border-transparent"}`}
          >
            <ImageIcon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Media</span>
            {isMediaComplete && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
          </button>
          <button 
            onClick={() => scrollToSection("variants")}
            className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-r-lg text-sm font-medium transition-colors border-l-4 ${activeSection === "variants" ? "bg-primary/10 text-primary border-primary" : "text-muted-foreground hover:bg-muted border-transparent"}`}
          >
            <Layers className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Pricing & Variants</span>
            {isVariantsComplete && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
          </button>
        </nav>
      </div>

      <div className="flex-1 w-full min-w-0">
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
          
          {/* Basic Info */}
          <div ref={sectionRefs["basic-info"]} className="bg-background border border-border p-6 md:p-8 rounded-2xl shadow-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/80"></div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                <Input {...form.register("name")} placeholder="Product Name" className="px-4 py-2.5 h-10 transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" />
                {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category <span className="text-destructive">*</span></label>
                <Combobox 
                  value={form.watch("categoryId")}
                  onChange={(val) => form.setValue("categoryId", val, { shouldValidate: true })}
                  options={categoryOptions}
                  placeholder="Search categories..."
                  error={!!form.formState.errors.categoryId}
                />
                {form.formState.errors.categoryId && <p className="text-xs text-destructive mt-1">{form.formState.errors.categoryId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Base Price <span className="text-destructive">*</span></label>
                <Input type="number" step="0.01" {...form.register("price")} placeholder="0.00" className="px-4 py-2.5 h-10 transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" />
                {form.formState.errors.price && <p className="text-xs text-destructive mt-1">{form.formState.errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select 
                  {...form.register("gender")}
                  className="flex w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-4 py-2.5 h-10 text-sm shadow-sm transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="flex w-full rounded-md border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground transition-all focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Product description..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Material</label>
                <Autocomplete 
                  value={form.watch("material") || ""}
                  onChange={(val) => form.setValue("material", val)}
                  options={materialOptions}
                  placeholder="e.g. 100% Cotton"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Autocomplete 
                  value={form.watch("brand") || ""}
                  onChange={(val) => form.setValue("brand", val)}
                  options={brandOptions}
                  placeholder="e.g. Nike"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Collection</label>
                <Autocomplete 
                  value={form.watch("collection") || ""}
                  onChange={(val) => form.setValue("collection", val)}
                  options={collectionOptions}
                  placeholder="e.g. Summer 2024"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div ref={sectionRefs["media"]} className="bg-background border border-border p-6 md:p-8 rounded-2xl shadow-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/80"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Media</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex w-full sm:w-auto items-center">
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="rounded-r-none h-10 px-4 transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary border-r-0"
                  />
                  <Button type="button" onClick={handleAddImageUrl} variant="secondary" className="rounded-l-none border border-input h-10 px-4 hover:shadow-md transition-shadow">
                    <LinkIcon className="w-4 h-4 mr-2" /> Add URL
                  </Button>
                </div>
              </div>
            </div>

            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragOverZone(true); }}
              onDragLeave={() => setIsDragOverZone(false)}
              onDrop={handleDropZoneDrop}
              className={`border-2 border-dashed rounded-xl p-8 md:p-12 flex flex-col items-center justify-center transition-all ${isDragOverZone ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border bg-muted/20 hover:bg-muted/40'}`}
            >
              <div className="flex items-center justify-center w-14 h-14 bg-background rounded-full shadow-sm mb-4">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Upload className={`w-6 h-6 ${isDragOverZone ? 'text-primary' : 'text-muted-foreground'}`} />}
              </div>
              <p className="text-sm font-medium mb-1">Drag and drop images here</p>
              <p className="text-xs text-muted-foreground mb-5">or click to browse your files (supports multiple)</p>
              
              <input 
                type="file" 
                id="image-upload" 
                className="hidden" 
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-md transition-all h-10 px-6 py-2">
                  Browse Files
                </span>
              </label>
            </div>

            {imageFields.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-2">
                {imageFields.map((field, index) => (
                  <div 
                    key={field.id} 
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group border rounded-xl overflow-hidden w-32 h-32 bg-muted/20 cursor-grab active:cursor-grabbing transition-all ${draggedImageIndex === index ? 'opacity-50 scale-95' : 'border-border shadow-sm hover:shadow-md'}`}
                  >
                    <img src={field.url} alt="Preview" className="w-full h-full object-cover" />
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[1px]">
                      <Button 
                        type="button"
                        variant="destructive" 
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-sm hover:scale-105 transition-transform"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {!field.isPrimary && (
                        <Button 
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs shadow-sm hover:scale-105 transition-transform"
                          onClick={() => setPrimaryImage(index)}
                        >
                          Make Primary
                        </Button>
                      )}
                    </div>

                    {field.isPrimary && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Variants */}
          <div ref={sectionRefs["variants"]} className="bg-background border border-border p-6 md:p-8 rounded-2xl shadow-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/80"></div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Pricing & Variants</h2>
            </div>
            
            {/* Options Section */}
            <div className="border-b border-border pb-6 space-y-4">
              <h3 className="text-sm font-semibold">Options</h3>
              
              <div className="space-y-4">
                {options.map((opt, i) => (
                  <div key={opt.name} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-24 font-medium text-sm text-muted-foreground">{opt.name}</div>
                    <div className="flex-1 flex flex-wrap items-center gap-2 bg-muted/10 p-2 rounded-xl border border-border/50">
                      {opt.values.map((v, j) => (
                        <div key={v} className="flex items-center bg-background border border-border shadow-sm px-3 py-1.5 rounded-full text-sm group transition-colors hover:border-primary/50">
                          {opt.name.toLowerCase() === "color" && (
                            <div 
                              className="w-3 h-3 rounded-full mr-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]" 
                              style={{ backgroundColor: v.toLowerCase().replace(/[^a-z]/g, '') || '#cbd5e1' }} 
                            />
                          )}
                          {v}
                          <button type="button" onClick={() => removeOptionValue(i, j)} className="ml-2 text-muted-foreground hover:text-destructive opacity-70 hover:opacity-100 transition-opacity">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center bg-transparent">
                        <Input 
                          placeholder={`Add ${opt.name.toLowerCase()}...`}
                          className="h-8 w-28 text-sm border-0 bg-transparent focus-visible:ring-0 shadow-none px-2 placeholder:text-muted-foreground/60"
                          value={newOptionValues[i] || ""}
                          onChange={(e) => setNewOptionValues({ ...newOptionValues, [i]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addOptionValue(i, newOptionValues[i]);
                            }
                          }}
                        />
                        {newOptionValues[i] && (
                           <Button type="button" variant="ghost" size="sm" className="px-2 h-7 rounded-full text-primary hover:bg-primary/10" onClick={() => addOptionValue(i, newOptionValues[i])}>
                             <Plus className="w-4 h-4" />
                           </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <h3 className="text-sm font-semibold">Generated Variants</h3>
              <div className="flex flex-wrap items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-border shadow-sm">
                <span className="text-xs font-medium px-2 text-muted-foreground whitespace-nowrap">Bulk edit:</span>
                <Input placeholder="Price" className="h-8 w-24 text-xs transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} />
                <Input placeholder="Stock" className="h-8 w-20 text-xs transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} />
                <Input placeholder="Compare At" className="h-8 w-24 text-xs transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" value={bulkCompareAt} onChange={(e) => setBulkCompareAt(e.target.value)} />
                <Button type="button" size="sm" className="h-8 text-xs px-4 hover:shadow-md transition-shadow" onClick={handleBulkEdit}>Apply</Button>
              </div>
            </div>

            {form.formState.errors.variants?.root && (
              <p className="text-xs text-destructive">{form.formState.errors.variants.root.message}</p>
            )}

            <div className="border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto max-h-[500px] relative">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-muted/80 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Variant</th>
                      <th className="px-4 py-3 font-medium">SKU</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                      <th className="px-4 py-3 font-medium">Compare At</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantFields.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          <Layers className="w-8 h-8 mx-auto mb-3 opacity-20" />
                          No variants yet. Add options above or add manually.
                        </td>
                      </tr>
                    ) : (
                      variantFields.map((field, index) => {
                        const sizeVal = form.watch(`variants.${index}.size`);
                        const colorVal = form.watch(`variants.${index}.color`);
                        const stockVal = form.watch(`variants.${index}.stock`) || 0;
                        const label = [sizeVal, colorVal].filter(Boolean).join(" / ") || "Default";
                        
                        return (
                          <tr key={field.id} className="border-b border-border last:border-0 group even:bg-muted/10 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium whitespace-nowrap text-foreground/80">
                              {label}
                            </td>
                            <td className="px-4 py-3 min-w-[140px]">
                              <Input {...form.register(`variants.${index}.sku`)} placeholder="SKU" className="h-9 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary bg-background/50" />
                              {form.formState.errors.variants?.[index]?.sku && <p className="text-[10px] text-destructive mt-1">{form.formState.errors.variants[index]?.sku?.message}</p>}
                            </td>
                            <td className="px-4 py-3 min-w-[120px]">
                              <Input type="number" step="0.01" {...form.register(`variants.${index}.price`)} placeholder="0.00" className="h-9 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary bg-background/50" />
                              {form.formState.errors.variants?.[index]?.price && <p className="text-[10px] text-destructive mt-1">{form.formState.errors.variants[index]?.price?.message}</p>}
                            </td>
                            <td className="px-4 py-3 min-w-[120px]">
                              <div className="flex items-center gap-2 relative">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${stockVal > 10 ? 'bg-green-500' : stockVal > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                <Input type="number" {...form.register(`variants.${index}.stock`)} placeholder="0" className="h-9 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary bg-background/50" />
                              </div>
                              {form.formState.errors.variants?.[index]?.stock && <p className="text-[10px] text-destructive mt-1">{form.formState.errors.variants[index]?.stock?.message}</p>}
                            </td>
                            <td className="px-4 py-3 min-w-[120px]">
                              <Input type="number" step="0.01" {...form.register(`variants.${index}.compareAtPrice`)} placeholder="0.00" className="h-9 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary bg-background/50" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeVariant(index)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" onClick={() => appendVariant({ size: "", color: "", sku: "", price: Number(form.getValues("price")) || 0, stock: 0, compareAtPrice: "" })} variant="outline" size="sm" className="hover:shadow-sm transition-shadow">
                <Plus className="w-4 h-4 mr-2" /> Add Variant Manually
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border bg-background/80 backdrop-blur-xl z-40 flex justify-end gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-[1400px] mx-auto flex justify-end gap-3 px-4 md:px-0">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} size="default" className="w-32 h-10 hover:shadow-sm transition-shadow">
              Cancel
            </Button>
          )}
          <Button type="button" size="default" className="w-40 h-10 hover:shadow-md transition-shadow" disabled={isPending} onClick={form.handleSubmit(onSubmit as any)}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /></> : initialData ? "Save Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </div>
  );
}
