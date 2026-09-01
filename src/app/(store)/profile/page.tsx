"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks";
import { ordersApi, Order } from "@/features/orders/api/orders.api";
import { wishlistApi } from "@/features/wishlist/api/wishlist.api";
import { useCartStore } from "@/features/cart/store/cart.store";
import { AccountLayout } from "@/components/layout/account/AccountLayout";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, CreditCard, Heart, MapPin, User, ChevronRight, ShoppingBag } from "lucide-react";

export default function DashboardPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  
  // Use existing cart store
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Fetch orders
  const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useQuery({
    queryKey: ["my-orders"],
    queryFn: ordersApi.getMyOrders,
    enabled: !!user,
  });

  // Fetch wishlist
  const { data: wishlist, isLoading: isWishlistLoading, isError: isWishlistError } = useQuery({
    queryKey: ["my-wishlist"],
    queryFn: wishlistApi.getMyWishlist,
    enabled: !!user,
  });

  // Calculate metrics
  const stats = useMemo(() => {
    if (!orders) return { totalOrders: 0, totalSpent: 0, activeOrders: 0 };
    
    let totalSpent = 0;
    let activeOrders = 0;
    
    orders.forEach(order => {
      if (order.status !== "CANCELLED") {
        totalSpent += order.totalAmount;
      }
      if (["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status)) {
        activeOrders += 1;
      }
    });

    return {
      totalOrders: orders.length,
      totalSpent,
      activeOrders
    };
  }, [orders]);

  const recentOrders = orders?.slice(0, 3) || [];
  const wishlistCount = wishlist?.length || 0;
  
  const isLoading = isUserLoading || isOrdersLoading || isWishlistLoading;

  if (!user && !isUserLoading) return null;

  return (
    <AccountLayout>
      <div className="space-y-12">
        {/* Welcome Section */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border/40">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">
              {isLoading ? <Skeleton className="h-8 w-64" /> : `Welcome Back, ${user?.name?.split(' ')[0] || 'User'}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? <Skeleton className="h-5 w-48" /> : "Here's an overview of your account activity."}
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Orders" 
            value={isLoading ? null : stats.totalOrders.toString()} 
            icon={<Package className="h-5 w-5" />} 
          />
          <StatCard 
            title="Active Orders" 
            value={isLoading ? null : stats.activeOrders.toString()} 
            icon={<ShoppingBag className="h-5 w-5" />} 
          />
          <StatCard 
            title="Total Spent" 
            value={isLoading ? null : `৳${stats.totalSpent.toLocaleString()}`} 
            icon={<CreditCard className="h-5 w-5" />} 
          />
          <StatCard 
            title="Wishlist Items" 
            value={isLoading ? null : wishlistCount.toString()} 
            icon={<Heart className="h-5 w-5" />} 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Column: Recent Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest">Recent Orders</h2>
              <Link href="/orders" className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {isOrdersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : isOrdersError ? (
              <div className="p-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                Failed to load recent orders.
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="bg-muted/20 border border-border/50 p-12 flex flex-col items-center justify-center text-center">
                <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-bold uppercase tracking-widest mb-2">No Orders Yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  You haven't placed any orders. Start exploring our collection!
                </p>
                <Link href="/shop">
                  <Button className="uppercase tracking-widest text-xs font-bold rounded-none h-12 px-8">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="group border border-border/50 bg-background hover:bg-muted/20 transition-colors p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <div>
                      <p className="text-sm font-bold tracking-widest mb-1">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span>{order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold">৳{order.totalAmount.toLocaleString()}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                          order.status === 'DELIVERED' ? 'text-green-600' :
                          order.status === 'CANCELLED' ? 'text-destructive' : 'text-amber-600'
                        }`}>
                          {order.status}
                        </p>
                      </div>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-9 rounded-none text-xs uppercase tracking-widest font-bold">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Profile & Quick Actions */}
          <div className="space-y-8">
            
            {/* Profile Summary Card */}
            <div className="bg-muted/20 border border-border/50 p-6">
              <div className="flex items-center gap-4 mb-6">
                {isLoading ? (
                  <Skeleton className="h-16 w-16 rounded-none" />
                ) : (
                  <Avatar image={user?.image} name={user?.name} size="lg" className="h-16 w-16 rounded-none border border-border/50" />
                )}
                <div className="flex-1 min-w-0">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-40" />
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                      {user?.phone && <p className="text-xs text-muted-foreground truncate mt-0.5">{user.phone}</p>}
                    </>
                  )}
                </div>
              </div>
              <Link href="/profile/settings">
                <Button variant="outline" className="w-full uppercase tracking-widest text-xs font-bold rounded-none border-2">
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-border/40 pb-4 mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <QuickLinkCard href="/addresses" icon={<MapPin />} label="Addresses" />
                <QuickLinkCard href="/wishlist" icon={<Heart />} label="Wishlist" />
                <QuickLinkCard href="/cart" icon={<ShoppingBag />} label={`Cart (${cartCount})`} />
                <QuickLinkCard href="/profile/settings" icon={<User />} label="Settings" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </AccountLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | null; icon: React.ReactNode }) {
  return (
    <div className="bg-background border border-border/50 p-6 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-foreground/30 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground relative z-10">{title}</h3>
        <div className="text-muted-foreground/40 group-hover:text-primary transition-colors relative z-10">
          {icon}
        </div>
      </div>
      <div>
        {value === null ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-2xl font-bold tracking-tight relative z-10">{value}</p>
        )}
      </div>
      {/* Decorative gradient */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-foreground/5 rounded-full blur-2xl group-hover:bg-foreground/10 transition-colors" />
    </div>
  );
}

function QuickLinkCard({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="group flex flex-col items-center justify-center p-6 border border-border/50 bg-background hover:bg-foreground hover:text-background transition-all duration-300 text-center">
      <div className="mb-3 text-muted-foreground group-hover:text-background transition-colors [&>svg]:h-6 [&>svg]:w-6">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </Link>
  );
}
