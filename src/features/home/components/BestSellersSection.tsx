"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/features/products/api/products.api';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Button } from '@/components/ui/button';

export function BestSellersSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetching a different set (e.g. sorted by price or just standard limit) to represent "Trending"
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trending-products'],
    queryFn: () => productsApi.getProducts({ limit: 4 }), // Without specific trending backend, we just get top 4 default sort
  });

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl font-black tracking-tighter uppercase">Trending Now</h2>
          <div className="h-px w-12 bg-foreground mt-6"></div>
        </div>

        {isLoading || !mounted ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] w-full animate-pulse bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10 text-muted-foreground">Unable to load trending products at this time.</div>
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
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

