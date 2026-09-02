'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, User, Heart, Package, LogOut, ChevronRight, MapPin, LayoutDashboard, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/features/auth/hooks';
import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/Logo';

const MOBILE_CATEGORIES: { name: string; href: string; className?: string }[] = [
  { name: 'Men', href: '/shop?gender=Men' },
  { name: 'Women', href: '/shop?gender=Women' },
  { name: 'Kids', href: '/shop?gender=Unisex' },
  { name: 'Accessories', href: '/shop?search=Accessories' },
];

const SIMPLE_LINKS = [
  { name: 'New Arrivals', href: '/shop?sort=createdAt-desc' },
  { name: 'Sale', href: '/shop?search=Sale', className: 'text-destructive font-semibold' },
];

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setOpen(false);
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="mr-2 hover:bg-muted/50 h-10 w-10 text-foreground" />}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[85vw] sm:w-[400px] flex flex-col p-0 border-r-0 shadow-2xl">
          <SheetHeader className="px-6 py-5 border-b border-border/50 bg-background flex items-start text-left">
            <SheetTitle className="text-2xl font-black tracking-tighter uppercase flex items-center">
              <Logo variant="mark" className="mr-2" onClick={() => setOpen(false)} />
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="flex flex-col py-2">
              {MOBILE_CATEGORIES.map((cat) => (
                <Link 
                  key={cat.name} 
                  href={cat.href} 
                  className={`flex items-center justify-between px-6 py-4 text-base font-bold uppercase tracking-widest transition-colors hover:bg-muted/30 hover:text-primary ${cat.className || ''}`} 
                  onClick={() => setOpen(false)}
                >
                  {cat.name}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </Link>
              ))}
              
              <div className="w-full h-px bg-border/40 my-3" />
              
              {SIMPLE_LINKS.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`flex items-center justify-between px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-muted/30 hover:text-primary ${link.className || ''}`} 
                  onClick={() => setOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="px-6 py-8 mt-4 bg-muted/5 border-t border-border/50 h-full">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Account</h4>
              
              {!isUserLoading && user ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 mb-2 p-4 bg-background rounded-sm border border-border/50 shadow-sm">
                    <Avatar image={user.image} name={user.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Link href="/profile" className="flex items-center py-2.5 text-sm font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      <LayoutDashboard className="mr-4 h-4 w-4 text-muted-foreground" /> Dashboard
                    </Link>
                    <Link href="/orders" className="flex items-center py-2.5 text-sm font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      <Package className="mr-4 h-4 w-4 text-muted-foreground" /> Orders
                    </Link>
                    <Link href="/wishlist" className="flex items-center py-2.5 text-sm font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      <Heart className="mr-4 h-4 w-4 text-muted-foreground" /> Wishlist
                    </Link>
                    <Link href="/addresses" className="flex items-center py-2.5 text-sm font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      <MapPin className="mr-4 h-4 w-4 text-muted-foreground" /> Addresses
                    </Link>
                    <Link href="/profile/settings" className="flex items-center py-2.5 text-sm font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      <User className="mr-4 h-4 w-4 text-muted-foreground" /> Settings
                    </Link>
                    {user.role === 'ADMIN' && (
                      <>
                        <div className="w-full h-px bg-border/40 my-2" />
                        <Link href="/admin/dashboard" className="flex items-center py-2.5 text-sm font-semibold hover:text-primary transition-colors text-primary" onClick={() => setOpen(false)}>
                          <LayoutDashboard className="mr-4 h-4 w-4 text-primary" /> Admin Dashboard
                        </Link>
                      </>
                    )}
                  </div>
                  
                  <div className="pt-6 mt-2 border-t border-border/50">
                    <button 
                      className="flex items-center py-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors text-left disabled:opacity-50"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? (
                        <Loader2 className="mr-4 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-4 h-4 w-4" />
                      )}
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full justify-center h-12 text-xs font-bold tracking-widest uppercase rounded-sm">Sign In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full justify-center h-12 text-xs font-bold tracking-widest uppercase rounded-sm">Create Account</Button>
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
