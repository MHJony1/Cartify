"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, CheckCircle, Package, Truck, CreditCard, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailsPage({ params }: OrderDetailsPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);

  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => ordersApi.adminGetSingleOrder(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => ordersApi.updateOrderStatus({ id, status }),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      setIsConfirmingCancel(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update order status");
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: (paymentStatus: string) => ordersApi.updatePaymentStatus({ id, paymentStatus }),
    onSuccess: () => {
      toast.success("Payment status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update payment status");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500/10 text-yellow-500";
      case "CONFIRMED": return "bg-blue-500/10 text-blue-500";
      case "PROCESSING": return "bg-indigo-500/10 text-indigo-500";
      case "SHIPPED": return "bg-purple-500/10 text-purple-500";
      case "DELIVERED": return "bg-green-500/10 text-green-500";
      case "CANCELLED": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500/10 text-yellow-500";
      case "PAID": 
      case "COMPLETED": return "bg-green-500/10 text-green-500";
      case "FAILED": return "bg-destructive/10 text-destructive";
      case "REFUNDED": return "bg-orange-500/10 text-orange-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Skeleton className="h-8 w-64 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto text-center py-20 bg-background rounded-lg border border-border">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">This order doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push("/admin/orders")}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground">{format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
            Order: {order.status}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getPaymentStatusColor(order.paymentStatus)}`}>
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Order Items</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded border border-border flex-shrink-0 overflow-hidden">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product?.slug || item.productId}`} className="font-medium hover:underline hover:text-primary transition-colors block truncate">
                      {item.product?.name || "Unknown Product"}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      <span>Size: {item.variantSize}</span>
                      <span>Color: {item.variantColor}</span>
                      <span>SKU: {item.variantSku}</span>
                    </div>
                  </div>
                  <div className="text-right sm:text-left flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block">
                    <span className="sm:hidden text-sm text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                    <div className="hidden sm:block text-sm text-muted-foreground text-right">{item.quantity} × ${item.price.toFixed(2)}</div>
                    <div className="font-medium text-right">${(item.quantity * item.price).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals Summary */}
            <div className="bg-muted/10 p-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(order.subtotal || order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border mt-2">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-lg">Manage Status</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Order Status</label>
                <select 
                  className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={order.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    if (newStatus === "CANCELLED") {
                      setIsConfirmingCancel(true);
                    } else {
                      updateStatusMutation.mutate(newStatus);
                    }
                  }}
                  disabled={order.status === "DELIVERED" || order.status === "CANCELLED" || updateStatusMutation.isPending}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
                  <p className="text-xs text-muted-foreground">This order has reached a final state and cannot be changed.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                <select 
                  className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={order.paymentStatus}
                  onChange={(e) => updatePaymentMutation.mutate(e.target.value)}
                  disabled={updatePaymentMutation.isPending}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-lg">Customer</h2>
            </div>
            <div className="p-4 text-sm space-y-3">
              <div>
                <p className="font-medium text-foreground">{order.user?.name || "Unknown Customer"}</p>
                <a href={`mailto:${order.user?.email}`} className="text-primary hover:underline">{order.user?.email}</a>
                {order.user?.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
              <Truck className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Shipping Address</h2>
            </div>
            <div className="p-4 text-sm">
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {order.shippingAddress || "No shipping address provided."}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Payment Method</h2>
            </div>
            <div className="p-4 text-sm font-medium">
              {order.paymentMethod}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {isConfirmingCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-lg border border-border shadow-lg max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Cancel Order?</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Are you sure you want to cancel this order? This will restock the inventory and notify the customer. 
              <strong> This action cannot be undone.</strong>
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsConfirmingCancel(false)} disabled={updateStatusMutation.isPending}>
                No, Keep Order
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => updateStatusMutation.mutate("CANCELLED")} 
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Cancelling..." : "Yes, Cancel Order"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
