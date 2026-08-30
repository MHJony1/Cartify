import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-block">
              <span className="text-2xl font-black tracking-tighter">CARTIFY</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Premium e-commerce platform offering the best products with exceptional customer service and fast delivery.
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/categories/electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="/categories/clothing" className="hover:text-primary transition-colors">Clothing</Link></li>
              <li><Link href="/categories/home" className="hover:text-primary transition-colors">Home & Garden</Link></li>
              <li><Link href="/categories/beauty" className="hover:text-primary transition-colors">Beauty</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Cartify. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-4 sm:mt-0">
            {/* Social icons placeholders */}
            <div className="h-5 w-5 rounded-full bg-muted-foreground/30 hover:bg-primary transition-colors cursor-pointer" />
            <div className="h-5 w-5 rounded-full bg-muted-foreground/30 hover:bg-primary transition-colors cursor-pointer" />
            <div className="h-5 w-5 rounded-full bg-muted-foreground/30 hover:bg-primary transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
