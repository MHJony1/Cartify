'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterSection() {
  return (
    <section className="py-16 md:py-24 bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Join Our Newsletter</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center" onSubmit={(e) => e.preventDefault()}>
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="w-full sm:max-w-sm" 
              required
            />
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
}
