"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks";
import { ordersApi } from "@/features/orders/api/orders.api";
import { Package, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountLayout } from "@/components/layout/account/AccountLayout";

export default function MyOrdersPage() {
  const { data: user } = useCurrentUser();

  const { data: orders = [], isLoading: isOrdersLoading, isError } = useQuery({
    queryKey: ["my-orders"],
    queryFn: ordersApi.getMyOrders,
    enabled: !!user,
  });

  if (!user) return null; // Handled by proxy/layout

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
    <AccountLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold uppercase tracking-widest border-b border-border/40 pb-6 mb-8">My Orders</h1>

        {isError ? (
          <div className="rounded-none border border-destructive/50 bg-destructive/10 p-6 flex items-center gap-3 text-destructive text-sm font-medium">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load orders. Please try again later.</p>
          </div>
        ) : isOrdersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-none" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-muted/20 border border-border/50 p-12 flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-bold uppercase tracking-widest mb-2">No Orders Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Looks like you haven't made any purchases yet. Start exploring our collection!
            </p>
            <Link href="/shop">
              <Button className="uppercase tracking-widest text-xs font-bold rounded-none h-12 px-8">
                Start Shopping
              </Button>
            </Link>
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
                  <div className="border border-border/50 bg-background hover:bg-muted/20 p-4 sm:p-6 transition-colors flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                    
                    {/* Image */}
                    <div className="h-20 w-20 shrink-0 bg-muted border border-border/50 overflow-hidden rounded-none">
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
                          <p className="font-bold text-sm tracking-widest uppercase mb-1">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <span className="font-bold">Total:</span> ৳{order.totalAmount.toLocaleString()}
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
                    <div className="hidden sm:flex shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
