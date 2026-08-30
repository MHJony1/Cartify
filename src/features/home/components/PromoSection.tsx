import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';

export function PromoSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-multiply" />
          
          <div className="relative z-10 flex flex-col items-center p-12 text-center md:p-20">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              Upgrade Your Workspace
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
              Discover our new collection of ergonomic furniture and premium accessories designed to boost your productivity.
            </p>


            <div className="mt-8 flex gap-4">
              <Link href="/shop?category=workspace" className={buttonVariants({ size: "lg", variant: "secondary" })}>
                Shop Workspace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
