import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EditorialSection() {
  return (
    <section className="py-10 md:py-16 lg:py-20 bg-background overflow-hidden">
      <div className="mx-auto w-full max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">The Lookbook</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-[1.1]">
              Effortless silhouettes for the modern wardrobe.
            </h2>
            <div className="h-px w-12 bg-foreground mt-6 mb-6"></div>
            <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed mb-10 max-w-md">
              Discover our latest editorial featuring curated pieces that blend contemporary design with uncompromising quality. Designed for seamless transitions from day to night.
            </p>
            <Link href="/categories/new-arrivals" className="w-fit">
              <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs font-semibold px-10 h-12 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors">
                Shop The Edit
              </Button>
            </Link>
          </div>

          <div className="lg:col-span-7 relative order-1 lg:order-2 h-[500px] md:h-[600px] lg:h-[700px] w-full">
            <div className="absolute inset-0 right-0 lg:right-12 bottom-12 lg:bottom-0 bg-muted overflow-hidden">
              {/* Primary large image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop)' }}
              />
              <div className="absolute inset-0 bg-stone-900/10 mix-blend-overlay pointer-events-none" />
            </div>
            
            {/* Secondary smaller overlay image for editorial feel */}
            <div className="absolute bottom-0 right-0 w-2/5 aspect-[3/4] bg-muted shadow-2xl hidden md:block border-8 border-background overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop)' }}
              />
              <div className="absolute inset-0 bg-stone-900/10 mix-blend-overlay pointer-events-none" />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
