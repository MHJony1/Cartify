import React from 'react';
import { ProductCard } from '@/features/products/components/ProductCard';

const MOCK_BEST_SELLERS = [
  {
    id: 'bs_1',
    name: 'Ergonomic Office Chair',
    price: 15500,
    originalPrice: 18000,
    rating: 4.8,
    reviewCount: 432,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=400&auto=format&fit=crop',
    badge: 'Top Rated',
  },
  {
    id: 'bs_2',
    name: 'Mechanical Keyboard',
    price: 8500,
    rating: 4.9,
    reviewCount: 890,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'bs_3',
    name: 'Noise-Cancelling Earbuds',
    price: 12000,
    rating: 4.7,
    reviewCount: 215,
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=400&auto=format&fit=crop',
  },
];

export function BestSellersSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
            <p className="mt-2 text-muted-foreground">What everyone is buying right now</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_BEST_SELLERS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
