'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, User, Heart, Package, LogOut, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/features/auth/hooks';
import { Avatar } from '@/components/ui/avatar';

const MOBILE_CATEGORIES: { name: string; href: string; className?: string }[] = [
  { name: 'Men', href: '/categories/men' },
  { name: 'Women', href: '/categories/women' },
  { name: 'Kids', href: '/categories/kids' },
  { name: 'Accessories', href: '/categories/accessories' },
];

const SIMPLE_LINKS = [
  { name: 'New Arrivals', href: '/categories/new-arrivals' },
  { name: 'Sale', href: '/categories/sale', className: 'text-destructive font-semibold' },
];

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="mr-2 hover:bg-muted/50 h-10 w-10" />}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[85vw] sm:w-[400px] flex flex-col p-0 border-r-0 shadow-2xl">
          <SheetHeader className="px-6 py-5 border-b text-left bg-muted/10">
            <SheetTitle className="text-2xl font-black tracking-tighter uppercase">CARTIFY</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="flex flex-col py-2">
              {MOBILE_CATEGORIES.map((cat) => (
                <Link 
                  key={cat.name} 
                  href={cat.href} 
                  className={`flex items-center justify-between px-6 py-4 text-lg font-medium uppercase tracking-wider transition-colors hover:bg-muted/50 ${cat.className || ''}`} 
                  onClick={() => setOpen(false)}
                >
                  {cat.name}
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                </Link>
              ))}
              
              <div className="w-full h-px bg-border/50 my-2" />
              
              {SIMPLE_LINKS.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`flex items-center justify-between px-6 py-4 text-lg font-medium uppercase tracking-wider transition-colors hover:bg-muted/50 ${link.className || ''}`} 
                  onClick={() => setOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="px-6 py-8 mt-4 bg-muted/10 border-t border-border/50 h-full">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Account</h4>
              
              {!isUserLoading && user ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 mb-2 p-4 bg-background rounded-lg border shadow-sm">
                    <Avatar image={user.image} name={user.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Link href="/profile" className="flex items-center py-2 text-base font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      <User className="mr-4 h-5 w-5 text-muted-foreground" /> Profile
                    </Link>
                    <Link href="/orders" className="flex items-center py-2 text-base font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      <Package className="mr-4 h-5 w-5 text-muted-foreground" /> Orders
                    </Link>
                    <Link href="/wishlist" className="flex items-center py-2 text-base font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      <Heart className="mr-4 h-5 w-5 text-muted-foreground" /> Wishlist
                    </Link>
                  </div>
                  
                  <div className="pt-6 mt-2 border-t border-border/50">
                    <button 
                      className="flex items-center py-2 text-base font-medium text-destructive hover:text-destructive/80 transition-colors text-left"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-4 h-5 w-5" /> Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full justify-center h-12 text-base font-semibold tracking-wide uppercase">Sign In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full justify-center h-12 text-base font-semibold tracking-wide uppercase">Create Account</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

