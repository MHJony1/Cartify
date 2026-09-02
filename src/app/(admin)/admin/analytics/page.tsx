"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, AnalyticsQuery } from "@/features/admin/api/analytics.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { AlertCircle, DollarSign, ShoppingCart, Users, Package, CreditCard, Star, Ticket } from "lucide-react";

type Period = "7d" | "30d" | "90d" | "1y";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

function LoadingCard({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[120px]" />
      </CardContent>
    </Card>
  );
}

function ErrorCard({ title, message }: { title: string; message?: string }) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-destructive">{title}</CardTitle>
        <AlertCircle className="h-4 w-4 text-destructive" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive/80 mt-2">{message || "Failed to load data."}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------
// Sections
// ---------------------------------------------------------

function SalesSection({ period }: { period: Period }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics", "sales", period],
    queryFn: () => analyticsApi.getSales({ period }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <LoadingCard title="Total Revenue" icon={DollarSign} />
          <LoadingCard title="Total Orders" icon={ShoppingCart} />
          <LoadingCard title="Average Order Value" icon={DollarSign} />
        </div>
        <Card>
          <CardHeader><CardTitle>Revenue Trends</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data) return <ErrorCard title="Sales Analytics" />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders (Paid/Completed)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Daily revenue over the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.timeline.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No sales data for this period.
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <RechartsTooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersSection({ period }: { period: Period }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics", "orders", period],
    queryFn: () => analyticsApi.getOrders({ period }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Order Status Distribution</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
      </Card>
    );
  }

  if (isError || !data) return <ErrorCard title="Orders Analytics" />;

  const pieData = [
    { name: "Pending", value: data.pending },
    { name: "Confirmed", value: data.confirmed },
    { name: "Processing", value: data.processing },
    { name: "Shipped", value: data.shipped },
    { name: "Delivered", value: data.delivered },
    { name: "Cancelled", value: data.cancelled },
  ].filter(d => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Distribution</CardTitle>
        <CardDescription>Total Orders: {data.total}</CardDescription>
      </CardHeader>
      <CardContent>
        {pieData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No orders for this period.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomersSection({ period }: { period: Period }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics", "customers", period],
    queryFn: () => analyticsApi.getCustomers({ period }),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <LoadingCard title="Total Customers" icon={Users} />
        <LoadingCard title="New Customers" icon={Users} />
        <LoadingCard title="Active Customers" icon={Users} />
        <LoadingCard title="Suspended" icon={Users} />
      </div>
    );
  }

  if (isError || !data) return <ErrorCard title="Customers Analytics" />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{data.totalUsers}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-600">New in Period</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-green-600">+{data.newUsersWithinPeriod}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{data.activeUsers}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-destructive">Suspended</CardTitle>
          <Users className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-destructive">{data.suspendedUsers}</div></CardContent>
      </Card>
    </div>
  );
}

function ProductsSection({ period }: { period: Period }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics", "products", period],
    queryFn: () => analyticsApi.getProducts({ period, limit: "5" }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
      </Card>
    );
  }

  if (isError || !data) return <ErrorCard title="Products Analytics" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Top 5 products by quantity sold in this period.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.topSelling.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No products sold in this period.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topSelling} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Bar dataKey="totalQuantitySold" fill="#8884d8" name="Quantity Sold" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InventorySection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics", "inventory"],
    queryFn: () => analyticsApi.getInventory(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingCard title="Total Stock Units" icon={Package} />
        <LoadingCard title="Low Stock Items" icon={Package} />
        <LoadingCard title="Out of Stock" icon={Package} />
      </div>
    );
  }

  if (isError || !data) return <ErrorCard title="Inventory Analytics" />;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stock Units</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{data.totalStockUnits}</div></CardContent>
      </Card>
      <Card className={data.lowStockCount > 0 ? "border-orange-500/50 bg-orange-500/5" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-600">Low Stock Items</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-orange-600">{data.lowStockCount}</div></CardContent>
      </Card>
      <Card className={data.outOfStockCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-destructive">Out of Stock</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-destructive">{data.outOfStockCount}</div></CardContent>
      </Card>
    </div>
  );
}

function PaymentsSection({ period }: { period: Period }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics", "payments", period],
    queryFn: () => analyticsApi.getPayments({ period }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Payment Status</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
      </Card>
    );
  }

  if (isError || !data) return <ErrorCard title="Payments Analytics" />;

  const statusData = [
    { name: "Paid", value: data.paid },
    { name: "Completed", value: data.completed },
    { name: "Pending", value: data.pending },
    { name: "Failed", value: data.failed },
    { name: "Refunded", value: data.refunded },
  ].filter(d => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Status</CardTitle>
        <CardDescription>Distribution of payment statuses in this period.</CardDescription>
      </CardHeader>
      <CardContent>
        {statusData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No payments for this period.
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewsSection({ period }: { period: Period }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics", "reviews", period],
    queryFn: () => analyticsApi.getReviews({ period }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Reviews Distribution</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
      </Card>
    );
  }

  if (isError || !data) return <ErrorCard title="Reviews Analytics" />;

  const ratingData = [
    { rating: "5 Stars", count: data.ratingDistribution["5 stars"] },
    { rating: "4 Stars", count: data.ratingDistribution["4 stars"] },
    { rating: "3 Stars", count: data.ratingDistribution["3 stars"] },
    { rating: "2 Stars", count: data.ratingDistribution["2 stars"] },
    { rating: "1 Star", count: data.ratingDistribution["1 star"] },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Reviews Overview</CardTitle>
          <CardDescription>Total: {data.totalReviews} | Avg: {data.averageRating.toFixed(1)} / 5</CardDescription>
        </div>
        <Star className="w-5 h-5 text-yellow-500" />
      </CardHeader>
      <CardContent>
        {data.totalReviews === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No reviews for this period.
          </div>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#FFBB28" name="Reviews" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CouponsSection({ period }: { period: Period }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics", "coupons", period],
    queryFn: () => analyticsApi.getCoupons({ period }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Coupon Usage</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
      </Card>
    );
  }

  if (isError || !data) return <ErrorCard title="Coupons Analytics" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Coupon Usage</CardTitle>
          <CardDescription>Discount & usage stats.</CardDescription>
        </div>
        <Ticket className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6 mt-4">
          <div className="flex justify-between items-center pb-4 border-b border-border/50">
            <span className="text-muted-foreground font-medium">Total Usage</span>
            <span className="text-2xl font-bold">{data.totalCouponUsage}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-border/50">
            <span className="text-muted-foreground font-medium">Discount Given</span>
            <span className="text-2xl font-bold text-green-600">${data.totalDiscountGiven.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Active Coupons: {data.activeCoupons}</span>
            <span className="text-muted-foreground">Expired: {data.expiredCoupons}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------
// Main Page
// ---------------------------------------------------------

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");

  return (
    <div className="space-y-8 pb-10 max-w-[1400px] mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border pb-4 pt-2 -mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your store's performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Period:</label>
          <select
            className="flex h-9 w-32 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Sales & Orders</h2>
          <SalesSection period={period} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Customers</h2>
          <CustomersSection period={period} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Inventory & Products</h2>
          <InventorySection />
          <div className="mt-4">
            <ProductsSection period={period} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Additional Insights</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <OrdersSection period={period} />
            <PaymentsSection period={period} />
            <div className="space-y-4">
              <ReviewsSection period={period} />
              <CouponsSection period={period} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
