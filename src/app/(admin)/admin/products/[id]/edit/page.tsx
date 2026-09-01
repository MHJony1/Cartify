"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => productsApi.getProductById(id),
  });

  const handleSuccess = () => {
    router.push("/admin/products");
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto text-center py-20 bg-background rounded-lg border border-border">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you are trying to edit does not exist or could not be loaded.</p>
        <Button onClick={handleCancel}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Make changes to {product.name}.</p>
        </div>
      </div>

      <ProductForm initialData={product} onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
