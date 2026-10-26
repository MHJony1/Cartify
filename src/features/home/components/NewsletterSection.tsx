import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterSection() {
  return (
    <section className="py-10 md:py-16 lg:py-20 bg-muted/10 border-t border-border/50">
      <div className="mx-auto w-full max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-xl flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Cartify Insider</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">Stay in the loop</h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground font-medium tracking-wide">
            Subscribe for exclusive access to new collections, editorial content, and private sales.
          </p>
          <div className="h-px w-12 bg-foreground mt-6 mb-10"></div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto w-full">
            <Input 
              type="email" 
              placeholder="Email Address" 
              className="w-full h-12 rounded-sm border-border bg-background px-4 text-sm focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground shadow-sm transition-all" 
              required
            />
            <Button type="button" className="w-full sm:w-auto h-12 mt-2 sm:mt-0 rounded-sm px-8 uppercase tracking-widest text-xs font-semibold shadow-sm hover:bg-foreground/90 transition-colors">
              Subscribe
            </Button>
          </div>
          
          <p className="mt-8 text-xs text-muted-foreground">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
}

