"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/admin/products");
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
          <p className="text-muted-foreground">Add a new product to your catalog.</p>
        </div>
      </div>

      <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
