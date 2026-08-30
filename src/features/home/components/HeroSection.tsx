import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-muted/30 pt-16 md:pt-24 lg:pt-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Elevate Your Everyday Essentials.
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Discover a curated collection of premium products designed to enhance your lifestyle. Quality craftsmanship meets modern design.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/shop" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto h-14 px-8 text-base" })}>
                Shop Collection
              </Link>
              <Link href="/categories" className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto h-14 px-8 text-base bg-transparent" })}>
                Explore Categories
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-square w-full rounded-2xl bg-muted/50 overflow-hidden shadow-2xl">
              {/* High-quality placeholder image representing premium products */}
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1000&auto=format&fit=crop)' }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative subtle gradient background */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
