"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-sm border text-center flex flex-col items-center">
      <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-6">
        Thank you for your purchase. Your order has been successfully placed and is now being processed.
      </p>

      {orderId && (
        <div className="bg-muted p-4 rounded-lg w-full mb-8 flex flex-col items-center">
          <span className="text-sm text-muted-foreground mb-1">Order Reference</span>
          <span className="font-mono font-medium text-foreground">{orderId}</span>
        </div>
      )}

      <div className="flex flex-col w-full gap-3">
        {/* We will build Order History in Phase 4 */}
        <Link href="/shop" className={buttonVariants({ size: "lg" })}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-muted/10">
      <Suspense fallback={<Skeleton className="w-96 h-[400px] rounded-2xl flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></Skeleton>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
