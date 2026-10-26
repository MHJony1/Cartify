"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/features/products/api/products.api';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedProductsSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getProducts({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  return (
    <section className="py-10 md:py-16 lg:py-20 bg-muted/30 border-y border-border/50">
      <div className="mx-auto w-full max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center mb-10 md:mb-14 text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">New Arrivals</h2>
          <p className="mt-3 text-muted-foreground text-sm font-medium tracking-wide">The latest pieces to refresh your wardrobe.</p>
          <div className="h-px w-12 bg-foreground mt-6"></div>
        </div>

        {/* Prevent hydration mismatch */}
        {isLoading || !mounted ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col gap-2">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10 text-muted-foreground">Unable to load new arrivals at this time.</div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {data?.data.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                images={product.images}
                variants={product.variants}
                isNew={true}
              />
            ))}
          </div>
        )}

        <div className="mt-12 md:mt-16 text-center">
          <Link href="/categories/new-arrivals">
            <Button variant="outline" className="w-full md:w-auto rounded-none uppercase tracking-widest text-xs font-semibold px-10 h-12 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors">
              View All New Arrivals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

