"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, ChevronDown, Check } from "lucide-react";

// Predefined filter options for premium fashion
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"];
const COLORS = ["Black", "White", "Navy", "Grey", "Beige", "Brown", "Red", "Blue", "Green"];
const GENDERS = ["Men", "Women", "Unisex"];
const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "createdAt-desc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const gender = searchParams.get("gender") || "";
  const size = searchParams.get("size") || "";
  const color = searchParams.get("color") || "";
  const sort = searchParams.get("sort") || "createdAt-desc";
  const inStock = searchParams.get("inStock") === "true";
  const minPriceStr = searchParams.get("minPrice");
  const maxPriceStr = searchParams.get("maxPrice");
  const page = Number(searchParams.get("page")) || 1;

  const [minPrice, setMinPrice] = useState(minPriceStr || "");
  const [maxPrice, setMaxPrice] = useState(maxPriceStr || "");
  
  // Resolve sort order
  const [sortBy, sortOrder] = sort.split("-");

  const queryParams = useMemo(() => ({
    search: search || undefined,
    categoryId: categoryId || undefined,
    gender: gender || undefined,
    size: size || undefined,
    color: color || undefined,
    minPrice: minPriceStr ? Number(minPriceStr) : undefined,
    maxPrice: maxPriceStr ? Number(maxPriceStr) : undefined,
    inStock: inStock ? true : undefined,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
    page,
    limit: 12,
  }), [search, categoryId, gender, size, color, minPriceStr, maxPriceStr, inStock, sortBy, sortOrder, page]);

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ["products", "shop", queryParams],
    queryFn: () => productsApi.getProducts(queryParams),
  });

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Always reset to page 1 when filtering changes
    if (!updates.page) {
      params.set("page", "1");
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  };

  const FilterSidebar = () => (
    <div className="space-y-10">
      {/* Category/Gender */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Department</h4>
        <div className="space-y-3">
          {GENDERS.map((g) => (
            <label key={g} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${gender === g ? 'border-primary bg-primary' : 'border-input group-hover:border-foreground/50'}`}>
                {gender === g && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
              </div>
              <span className={`text-sm ${gender === g ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{g}</span>
              <input type="radio" className="hidden" checked={gender === g} onChange={() => updateFilters({ gender: gender === g ? null : g })} />
            </label>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const isSelected = color === c;
            return (
              <button
                key={c}
                onClick={() => updateFilters({ color: isSelected ? null : c })}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  isSelected 
                    ? "border-primary bg-primary/5 text-primary font-medium" 
                    : "border-input bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const isSelected = size === s;
            return (
              <button
                key={s}
                onClick={() => updateFilters({ size: isSelected ? null : s })}
                className={`flex items-center justify-center h-10 min-w-10 px-2 rounded-md border text-sm transition-colors ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-input bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Price Range (৳)</h4>
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
          <Input 
            type="number" 
            placeholder="Min" 
            value={minPrice} 
            onChange={(e) => setMinPrice(e.target.value)} 
            className="h-9 text-sm rounded-none border-t-0 border-x-0 border-b-2 focus-visible:ring-0 px-0"
          />
          <span className="text-muted-foreground">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(e.target.value)} 
            className="h-9 text-sm rounded-none border-t-0 border-x-0 border-b-2 focus-visible:ring-0 px-0"
          />
          <Button type="submit" size="sm" variant="secondary" className="h-9 px-3 shrink-0">Go</Button>
        </form>
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${inStock ? 'border-primary bg-primary' : 'border-input group-hover:border-foreground/50'}`}>
            {inStock && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
          <span className={`text-sm ${inStock ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>In Stock Only</span>
          <input type="checkbox" className="hidden" checked={inStock} onChange={() => updateFilters({ inStock: inStock ? null : "true" })} />
        </label>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-[1400px]">
      
      {/* Page Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-4">
          {search ? `Search: ${search}` : categoryId ? 'Category Collection' : 'All Products'}
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Discover our curated selection of premium fashion. Meticulously designed for the modern wardrobe.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border/50">
        
        {/* Mobile Filter Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={
              <Button variant="outline" className="w-full sm:w-auto font-medium uppercase tracking-widest text-xs h-10">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            } />
            <SheetContent side="left" className="w-full sm:w-[400px] sm:max-w-full overflow-y-auto pt-16">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-left font-bold uppercase tracking-widest">Filters</SheetTitle>
              </SheetHeader>
              <FilterSidebar />
              <div className="mt-12 sticky bottom-0 bg-background pt-4 pb-8 border-t border-border">
                <Button variant="outline" className="w-full uppercase tracking-widest font-semibold" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Count */}
        <div className="text-sm font-medium text-muted-foreground order-3 sm:order-1">
          {isLoading ? <Skeleton className="h-5 w-24" /> : isError ? null : `${productsData?.meta?.total || 0} Results`}
        </div>

        {/* Sort & Clear (Desktop) */}
        <div className="flex items-center gap-6 order-2 sm:order-3">
          <div className="hidden md:block">
            {(gender || size || color || minPriceStr || maxPriceStr || inStock || search) && (
              <button onClick={clearAllFilters} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground transition-all">
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="relative group">
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="appearance-none bg-transparent text-sm font-medium uppercase tracking-wider text-foreground pr-8 py-2 cursor-pointer focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isError ? (
            <div className="py-24 text-center">
              <p className="text-destructive mb-2 font-medium">Failed to load products.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-[3/4] w-full rounded-sm" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : productsData?.data.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center">
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">We couldn't find anything matching your current filters.</p>
              <Button variant="outline" onClick={clearAllFilters} className="uppercase tracking-widest font-semibold">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8 lg:gap-y-14">
              {productsData?.data.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  images={product.images}
                  variants={product.variants}
                  isNew={
                    (new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 3600 * 24) < 14
                  }
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {productsData?.meta && productsData.meta.totalPages > 1 && (
            <div className="mt-20 flex justify-center border-t border-border/50 pt-10">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateFilters({ page: String(page - 1) })}
                  className="uppercase tracking-widest text-xs font-semibold px-4"
                >
                  Previous
                </Button>
                <div className="flex items-center justify-center px-4 text-sm font-medium">
                  {page} / {productsData.meta.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= productsData.meta.totalPages}
                  onClick={() => updateFilters({ page: String(page + 1) })}
                  className="uppercase tracking-widest text-xs font-semibold px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-24 text-center">
        <Skeleton className="h-10 w-64 mx-auto mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full" />)}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
