import React from 'react';
import Link from 'next/link';

export function EditorialSection() {
  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">The Lookbook</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase mb-6 leading-[1.1]">
              Effortless silhouettes for the modern wardrobe.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-md">
              Discover our latest editorial featuring curated pieces that blend contemporary design with uncompromising quality. Designed for seamless transitions from day to night.
            </p>
            <Link 
              href="/categories/new-arrivals" 
              className="inline-flex items-center text-sm font-semibold uppercase tracking-widest hover:text-muted-foreground transition-colors group w-fit"
            >
              Shop The Edit
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          <div className="lg:col-span-7 relative order-1 lg:order-2 h-[500px] md:h-[600px] lg:h-[700px] w-full">
            <div className="absolute inset-0 right-0 lg:right-12 bottom-12 lg:bottom-0 bg-muted">
              {/* Primary large image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop)' }}
              />
            </div>
            
            {/* Secondary smaller overlay image for editorial feel */}
            <div className="absolute bottom-0 right-0 w-2/5 aspect-[3/4] bg-muted shadow-2xl hidden md:block border-4 border-background">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop)' }}
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
