"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks";
import { ordersApi } from "@/features/orders/api/orders.api";
import { ArrowLeft, MapPin, CreditCard, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/shared/LoadingState";

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !isUserLoading && !user) {
      router.push(`/login?redirect=/orders/${id}`);
    }
  }, [mounted, isUserLoading, user, router, id]);

  const { data: order, isLoading: isOrderLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getSingleOrder(id),
    enabled: !!user && !!id,
  });

  if (!mounted || isUserLoading || isOrderLoading) {
    return <LoadingState fullScreen />;
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for.</p>
        <Button onClick={() => router.push("/orders")}>
          Back to My Orders
        </Button>
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "SHIPPED": return "bg-purple-100 text-purple-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl min-h-[60vh]">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-muted-foreground mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
             <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
               {order.status}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 bg-muted/50 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
              </h2>
            </div>
            
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex gap-4 sm:gap-6">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-lg bg-muted border overflow-hidden">
                    <img 
                      src={item.product?.images?.[0]?.url || "/placeholder.jpg"} 
                      alt={item.product?.name || "Product"} 
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image' }}
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-medium text-base line-clamp-2">{item.product?.name || "Unknown Product"}</h3>
                        <span className="font-semibold whitespace-nowrap">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mt-2">
                        {item.variantSize && <div>Size: <span className="text-foreground font-medium">{item.variantSize}</span></div>}
                        {item.variantColor && <div>Color: <span className="text-foreground font-medium">{item.variantColor}</span></div>}
                        {item.variantSku && <div>SKU: <span className="text-foreground">{item.variantSku}</span></div>}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Qty: </span>
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ৳{item.price.toLocaleString()} each
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{(order.subtotal || 0).toLocaleString()}</span>
              </div>
              
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-৳{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between items-center">
                <span className="font-semibold text-base">Total</span>
                <span className="font-bold text-xl text-primary">৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              Shipping Address
            </h2>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {order.shippingAddress}
            </p>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Payment Information
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-medium">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
