import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterSection() {
  return (
    <section className="py-20 bg-muted/10 border-t border-border/50">
      <div className="mx-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Cartify Insider</p>
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-6">Stay in the loop</h2>
          <p className="text-base text-muted-foreground mb-10">
            Subscribe for exclusive access to new collections, editorial content, and private sales.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Email Address" 
              className="w-full h-12 rounded-none border-t-0 border-x-0 border-b-2 border-foreground/20 bg-transparent px-2 text-base focus-visible:ring-0 focus-visible:border-foreground shadow-none transition-all" 
              required
            />
            <Button type="button" variant="ghost" className="w-full sm:w-auto h-12 mt-4 sm:mt-0 rounded-none border-b-2 border-foreground/20 px-8 uppercase tracking-widest font-semibold hover:border-foreground hover:bg-transparent">
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

