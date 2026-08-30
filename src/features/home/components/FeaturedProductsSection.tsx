"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/features/products/api/products.api';
import { ProductCard } from '@/features/products/components/ProductCard';

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
    <section className="py-16 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Handpicked selections from our most popular collections, curated just for you.
          </p>
        </div>

        {/* Prevent hydration mismatch by rendering a skeleton or null before mounting if necessary, though useQuery is fine. */}
        {isLoading || !mounted ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 w-full animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center text-destructive">Failed to load products.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data?.data.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                images={product.images}
                variants={product.variants}
                // Optional UI properties not strictly on Product type yet
                isNew={true}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link 
            href="/shop?collection=featured" 
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View All Featured
          </Link>
        </div>
      </div>
    </section>
  );
}
