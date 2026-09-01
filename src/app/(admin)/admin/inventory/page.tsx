"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/features/admin/api/inventory.api";
import { Button } from "@/components/ui/button";
import { AlertCircle, Search, Package, ArrowUpRight, ArrowDownRight, PackageOpen, Settings2 } from "lucide-react";
import StockAdjustmentModal, { AdjustmentType } from "./components/StockAdjustmentModal";

// Simple debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const search = useDebounce(searchInput, 500);
  const [stockStatus, setStockStatus] = useState(searchParams.get("stockStatus") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const limit = 10;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    productId: string;
    variantId: string;
    variantSku: string;
    productName: string;
    currentStock: number;
    type: AdjustmentType;
  }>({
    isOpen: false,
    productId: "",
    variantId: "",
    variantSku: "",
    productName: "",
    currentStock: 0,
    type: "RESTOCK",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stockStatus) params.set("stockStatus", stockStatus);
    if (page > 1) params.set("page", page.toString());
    
    router.replace(`/admin/inventory?${params.toString()}`, { scroll: false });
  }, [search, stockStatus, page, router]);

  useEffect(() => {
    setPage(1);
  }, [search, stockStatus]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin", "inventory-analytics"],
    queryFn: () => inventoryApi.getAnalytics(),
  });

  const { data: inventoryData, isLoading, isError } = useQuery({
    queryKey: ["admin", "inventory", { search, stockStatus, page, limit }],
    queryFn: () => inventoryApi.getInventory({
      search: search || undefined,
      stockStatus: stockStatus || undefined,
      page,
      limit,
    }),
  });

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "IN_STOCK": return "bg-green-500/10 text-green-500";
      case "LOW_STOCK": return "bg-yellow-500/10 text-yellow-500";
      case "OUT_OF_STOCK": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const openModal = (
    product: any,
    variant: any,
    type: AdjustmentType
  ) => {
    setModalState({
      isOpen: true,
      productId: product.id,
      variantId: variant.id,
      variantSku: variant.sku,
      productName: product.name,
      currentStock: variant.stock,
      type,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage product stock and view inventory levels.</p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background rounded-lg border border-border p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold mt-1">{analyticsLoading ? "..." : analytics?.totalProducts}</p>
          </div>
          <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <Package className="h-5 w-5 text-indigo-500" />
          </div>
        </div>
        <div className="bg-background rounded-lg border border-border p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Units in Stock</p>
            <p className="text-2xl font-bold mt-1">{analyticsLoading ? "..." : analytics?.totalStockUnits}</p>
          </div>
          <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center">
            <PackageOpen className="h-5 w-5 text-green-500" />
          </div>
        </div>
        <div className="bg-background rounded-lg border border-border p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Low Stock Variants</p>
            <p className="text-2xl font-bold mt-1">{analyticsLoading ? "..." : analytics?.lowStockCount}</p>
          </div>
          <div className="h-10 w-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <ArrowDownRight className="h-5 w-5 text-yellow-500" />
          </div>
        </div>
        <div className="bg-background rounded-lg border border-border p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Out of Stock Variants</p>
            <p className="text-2xl font-bold mt-1">{analyticsLoading ? "..." : analytics?.outOfStockCount}</p>
          </div>
          <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-background rounded-lg border border-border p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name..."
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 pl-9 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            className="flex h-9 w-full md:w-48 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
          >
            <option value="">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading inventory...</div>
        ) : isError ? (
          <div className="p-8 text-center text-destructive flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>Failed to load inventory.</p>
          </div>
        ) : !inventoryData?.data || inventoryData.data.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <p className="text-lg font-medium">No inventory found</p>
            <p className="text-muted-foreground mt-1 mb-4">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Product / SKU</th>
                  <th className="px-6 py-4 font-medium">Variants</th>
                  <th className="px-6 py-4 font-medium">Total Stock</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventoryData.data.map((product: any) => (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-muted/10 transition-colors bg-muted/5">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {product.name}
                        <div className="text-xs font-normal text-muted-foreground mt-1">{product.category.name}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {product.variants.length} variant(s)
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {product.totalStock}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStockStatusColor(product.stockStatus)}`}>
                          {product.stockStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground text-xs">
                        {/* Parent row actions if any */}
                      </td>
                    </tr>
                    {/* Variant Rows */}
                    {product.variants.map((variant: any) => (
                      <tr key={variant.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 pl-10 text-muted-foreground">
                          ↳ {variant.sku}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground text-xs">
                          {variant.size} • {variant.color}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`font-semibold ${variant.stock > 0 ? 'text-foreground' : 'text-destructive'}`}>
                            {variant.stock}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {variant.stock === 0 ? (
                            <span className="text-[10px] text-destructive uppercase font-bold tracking-wider">Out of Stock</span>
                          ) : variant.stock <= 10 ? (
                            <span className="text-[10px] text-yellow-500 uppercase font-bold tracking-wider">Low Stock</span>
                          ) : (
                            <span className="text-[10px] text-green-500 uppercase font-bold tracking-wider">In Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={() => openModal(product, variant, "RESTOCK")}
                            >
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                              Restock
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => openModal(product, variant, "ADJUST")}
                            >
                              <Settings2 className="w-3 h-3 mr-1" />
                              Adjust
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                              onClick={() => openModal(product, variant, "DAMAGE")}
                            >
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                              Damage
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {inventoryData?.meta && inventoryData.meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing page {inventoryData.meta.page} of {inventoryData.meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= inventoryData.meta.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <StockAdjustmentModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        productId={modalState.productId}
        variantId={modalState.variantId}
        variantSku={modalState.variantSku}
        productName={modalState.productName}
        currentStock={modalState.currentStock}
        type={modalState.type}
      />
    </div>
  );
}
