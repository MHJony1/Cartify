import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-background">
      {/* Cloudinary-ready configuration placeholder via high-res Unsplash */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop)',
          backgroundPosition: '50% 30%' 
        }}
      />
      
      {/* Subtle overlay for text readability without darkening too much */}
      <div className="relative z-10 mx-auto w-full flex flex-col items-center text-center px-4">
        <p className="text-sm md:text-base font-semibold tracking-[0.2em] text-white/90 uppercase mb-4 drop-shadow-sm">
          Autumn / Winter Collection
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white uppercase max-w-[1400px] drop-shadow-lg leading-[0.95]">
          Modern Essentials.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-md">
          Discover a curated collection of premium apparel designed to elevate your everyday wardrobe. Minimalist design, uncompromising quality.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/categories/new-arrivals" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-14 px-10 rounded-none bg-white text-black hover:bg-white/90 text-sm font-semibold tracking-widest uppercase transition-colors">
              Shop New Arrivals
            </Button>
          </Link>
          <Link href="/categories/women" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full h-14 px-10 rounded-none bg-transparent border-white text-white hover:bg-white hover:text-black text-sm font-semibold tracking-widest uppercase transition-colors">
              Explore Collection
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

