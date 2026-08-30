"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks";
import { ordersApi } from "@/features/orders/api/orders.api";
import { Package, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyOrdersPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !isUserLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [mounted, isUserLoading, user, router]);

  const { data: orders = [], isLoading: isOrdersLoading, isError } = useQuery({
    queryKey: ["my-orders"],
    queryFn: ordersApi.getMyOrders,
    enabled: !!user,
  });

  if (!mounted || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 bg-muted rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl min-h-[60vh]">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Orders</h1>

      {isError ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load orders. Please try again later.</p>
        </div>
      ) : isOrdersLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-32 bg-muted rounded-xl border" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center flex flex-col items-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't made any purchases yet.</p>
          <Button onClick={() => router.push("/products")}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const firstItemImage = order.items[0]?.product?.images?.[0];
            
            return (
              <Link 
                key={order.id} 
                href={`/orders/${order.id}`}
                className="block group"
              >
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 transition-all hover:border-primary/50 hover:shadow-md flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                  
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 rounded-lg bg-muted border overflow-hidden">
                    <img 
                      src={firstItemImage?.url || "/placeholder.jpg"} 
                      alt="Order Preview" 
                      className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image' }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-lg line-clamp-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <span className="font-medium">Total:</span> ৳{order.totalAmount.toLocaleString()}
                      </div>
                      <div className="hidden sm:block text-muted-foreground">•</div>
                      <div className="text-muted-foreground">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </div>
                      <div className="hidden sm:block text-muted-foreground">•</div>
                      <div className="text-muted-foreground">
                        Payment: {order.paymentStatus}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden sm:flex shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
