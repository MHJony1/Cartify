'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="mr-2" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="text-left font-bold tracking-tighter">CARTIFY</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-8">
            <Link href="/" className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/shop" className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setOpen(false)}>
              Shop
            </Link>
            <Link href="/categories" className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setOpen(false)}>
              Categories
            </Link>
            <div className="mt-8 flex flex-col gap-4">
              <Button variant="outline" className="justify-start w-full" onClick={() => setOpen(false)}>
                <User className="mr-2 h-4 w-4" /> Account
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
