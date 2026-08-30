import React from 'react';
import Link from 'next/link';

const MOCK_CATEGORIES = [
  { id: '1', name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop' },
  { id: '2', name: 'Minimalist Apparel', image: 'https://images.unsplash.com/photo-1434389678232-0408d37ab6bc?q=80&w=600&auto=format&fit=crop' },
  { id: '3', name: 'Home Essentials', image: 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?q=80&w=600&auto=format&fit=crop' },
  { id: '4', name: 'Wellness & Beauty', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop' },
];

export function CategoryShowcase() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="mt-2 text-muted-foreground">Find exactly what you&apos;re looking for</p>
          </div>
          <Link href="/categories" className="hidden text-sm font-medium text-primary hover:underline sm:block">
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_CATEGORIES.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.id}`}
              className="group relative flex h-64 w-full flex-col overflow-hidden rounded-xl bg-muted transition-transform hover:-translate-y-1"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
              <div className="relative mt-auto p-6">
                <h3 className="text-xl font-semibold text-white drop-shadow-sm">{category.name}</h3>
                <span className="mt-2 inline-flex items-center text-sm font-medium text-white/90">
                  Shop Now <span className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
            View All Categories &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
