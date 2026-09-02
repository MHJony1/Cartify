import React from 'react';
import Link from 'next/link';

const PREMIUM_CATEGORIES = [
  { 
    id: 'women', 
    name: 'Women', 
    image: 'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=800&auto=format&fit=crop',
    className: 'md:col-span-2 md:row-span-2 h-[400px] md:h-[600px]'
  },
  { 
    id: 'men', 
    name: 'Men', 
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop',
    className: 'md:col-span-1 md:row-span-1 h-[300px] md:h-[285px]'
  },
  { 
    id: 'accessories', 
    name: 'Accessories', 
    image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop',
    className: 'md:col-span-1 md:row-span-1 h-[300px] md:h-[285px]'
  },
];

export function CategoryShowcase() {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl font-black tracking-tighter uppercase">Shop by Category</h2>
          <div className="h-px w-12 bg-foreground mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {PREMIUM_CATEGORIES.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.id}`}
              className={`group relative flex flex-col overflow-hidden bg-muted ${category.className}`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/30" />
              <div className="relative mt-auto p-8 flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-widest text-white uppercase drop-shadow-md">{category.name}</h3>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

