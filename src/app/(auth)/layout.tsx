import React from 'react';
import Link from 'next/link';
import { GoogleAuthProviderWrapper } from '@/features/auth/components/GoogleAuthProviderWrapper';
import { Heart, ShoppingBag } from 'lucide-react';
import { MiniCart } from '@/features/cart/components/MiniCart';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Premium Minimal Header */}
      <header className="flex-shrink-0 w-full px-6 py-8 md:px-12 md:py-10 flex items-center justify-between z-10 relative bg-white lg:bg-transparent lg:absolute lg:top-0 lg:left-0 lg:right-0">
        <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-neutral-900 transition-opacity hover:opacity-70">
          CARTIFY
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/shop" className="text-[12px] font-semibold tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors hidden sm:block">
            Continue Shopping
          </Link>
          <div className="flex items-center gap-4 border-l border-neutral-200 pl-6">
            <Link href="/wishlist" className="text-neutral-400 hover:text-neutral-900 transition-colors">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Link>
            <MiniCart />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative">
        <GoogleAuthProviderWrapper>
          {children}
        </GoogleAuthProviderWrapper>
      </main>

      {/* Premium Minimal Footer */}
      <footer className="flex-shrink-0 w-full px-6 py-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-[11px] font-semibold tracking-widest uppercase text-neutral-400 bg-white z-10 relative">
        <div className="mb-4 sm:mb-0">
          © {new Date().getFullYear()} Cartify
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-neutral-900 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-neutral-900 transition-colors">Terms</Link>
          <Link href="/shop" className="hover:text-neutral-900 transition-colors">Shop</Link>
        </div>
      </footer>
    </div>
  );
}
