"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks";
import { wishlistApi } from "@/features/wishlist/api/wishlist.api";
import { Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products/components/ProductCard";

export default function WishlistPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !isUserLoading && !user) {
      router.push("/login?redirect=/wishlist");
    }
  }, [mounted, isUserLoading, user, router]);

  const { data: wishlistItems = [], isLoading: isWishlistLoading, isError } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getMyWishlist,
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl min-h-[60vh]">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Wishlist</h1>

      {isError ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load wishlist. Please try again later.</p>
        </div>
      ) : isWishlistLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-80 bg-muted rounded-xl border" />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center flex flex-col items-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save items you like and they will show up here.</p>
          <Button onClick={() => router.push("/products")}>
            Explore Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
  );
}
