import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PromoSection() {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto w-full max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="relative overflow-hidden bg-muted h-[400px] md:h-[500px] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop)' }}
          />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="relative z-10 flex flex-col items-center p-8 text-center max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-white uppercase mb-4">
              The Summer Edit
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-6 drop-shadow-md">
              Breeze Through The Season
            </h2>
            <p className="text-base text-white/90 mb-8 drop-shadow-sm">
              Discover lightweight linens and breathable cottons designed for the warmest days.
            </p>

            <Link href="/categories/women">
              <Button size="lg" className="rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest font-semibold px-8 h-12">
                Discover More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

