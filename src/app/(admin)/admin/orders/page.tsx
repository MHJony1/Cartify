"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";
import { Button } from "@/components/ui/button";
import { Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local State mapped from URL
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get("paymentStatus") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const limit = 10;

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    if (page > 1) params.set("page", page.toString());
    
    router.replace(`/admin/orders?${params.toString()}`, { scroll: false });
  }, [status, paymentStatus, page, router]);

  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ["admin", "orders", { status, paymentStatus, page, limit }],
    queryFn: () => ordersApi.getAllOrders({
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      page,
      limit,
    }),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">View and manage customer orders.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background rounded-lg border border-border p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex flex-1 gap-4">
          <select 
            className="flex h-9 w-full md:w-48 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select 
            className="flex h-9 w-full md:w-48 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading orders...</div>
        ) : isError ? (
          <div className="p-8 text-center text-destructive flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>Failed to load orders.</p>
          </div>
        ) : !ordersData?.data || ordersData.data.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-muted-foreground mt-1 mb-4">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ordersData.data.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-medium">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{order.user?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{order.user?.email || "No email"}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {ordersData?.meta && ordersData.meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing page {ordersData.meta.page} of {ordersData.meta.totalPages}
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
                disabled={page >= ordersData.meta.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
