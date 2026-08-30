"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/features/products/api/products.api';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Button } from '@/components/ui/button';

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
    <section className="py-16 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">New Arrivals</h2>
            <p className="mt-2 text-muted-foreground">The latest pieces to refresh your wardrobe.</p>
          </div>
          <Link href="/categories/new-arrivals" className="hidden md:block">
            <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs font-semibold px-6 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors">
              View All
            </Button>
          </Link>
        </div>

        {/* Prevent hydration mismatch */}
        {isLoading || !mounted ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] w-full animate-pulse bg-muted" />
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

        <div className="mt-12 text-center md:hidden">
          <Link href="/categories/new-arrivals">
            <Button variant="outline" className="w-full rounded-none uppercase tracking-widest text-xs font-semibold px-6 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors">
              View All New Arrivals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

