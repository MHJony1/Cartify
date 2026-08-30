import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileNavigation } from './MobileNavigation';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <MobileNavigation />
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter">CARTIFY</span>
            </Link>
            
            <nav className="hidden md:ml-10 md:flex md:gap-6">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">Home</Link>
              <Link href="/shop" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Shop</Link>
              <Link href="/categories" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Categories</Link>
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="hidden flex-1 items-center md:flex md:max-w-xs">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full rounded-full bg-muted/50 pl-8 md:max-w-[300px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]">
                  0
                </Badge>
                <span className="sr-only">Cart</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
