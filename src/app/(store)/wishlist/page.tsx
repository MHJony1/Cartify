"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks";
import { wishlistApi } from "@/features/wishlist/api/wishlist.api";
import { Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/features/products/components/ProductCard";
import { AccountLayout } from "@/components/layout/account/AccountLayout";

export default function WishlistPage() {
  const { data: user } = useCurrentUser();

  const { data: wishlistItems = [], isLoading: isWishlistLoading, isError } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getMyWishlist,
    enabled: !!user,
  });

  if (!user) return null; // Handled by proxy/layout

  return (
    <AccountLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold uppercase tracking-widest border-b border-border/40 pb-6 mb-8">My Wishlist</h1>

        {isError ? (
          <div className="rounded-none border border-destructive/50 bg-destructive/10 p-6 flex items-center gap-3 text-destructive text-sm font-medium">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load wishlist. Please try again later.</p>
          </div>
        ) : isWishlistLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-none" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-muted/20 border border-border/50 p-12 flex flex-col items-center justify-center text-center">
            <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-bold uppercase tracking-widest mb-2">Your Wishlist is Empty</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Save items you like and they will show up here.
            </p>
            <Link href="/shop">
              <Button className="uppercase tracking-widest text-xs font-bold rounded-none h-12 px-8">
                Explore Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wishlistItems.map((item) => (
              <ProductCard
                key={item.product.id}
                id={item.product.id}
                name={item.product.name}
                slug={item.product.slug}
                price={item.product.price}
                image={item.product.image || undefined}
                variants={item.product.variants}
              />
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
