"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/features/cart/store/cart.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function MiniCart() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const cart = useCartStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the mini-cart automatically if navigating to full cart or checkout
  useEffect(() => {
    if (pathname === '/cart' || pathname === '/checkout') {
      setIsOpen(false);
    }
  }, [pathname]);

  const totalCartItems = mounted ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const subtotal = mounted ? cart.items.reduce((total, item) => total + item.price * item.quantity, 0) : 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger render={
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <ShoppingBag className="h-5 w-5" />
          {mounted && totalCartItems > 0 && (
            <Badge variant="default" className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full p-0 text-[10px] bg-primary text-primary-foreground border-background border-2 font-bold shadow-sm">
              {totalCartItems}
            </Badge>
          )}
          <span className="sr-only">Cart</span>
        </Button>
      } />
      <SheetContent side="right" className="w-full sm:w-[450px] p-0 flex flex-col border-l border-border bg-background shadow-2xl z-[60]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
          <SheetTitle className="text-sm font-bold uppercase tracking-widest m-0">Your Bag ({totalCartItems})</SheetTitle>
          <SheetClose render={
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mr-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          } />
        </div>

        {/* Content */}
        {!mounted ? (
          <div className="flex-1 p-6 flex flex-col gap-6">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-32 w-24 rounded-md" />
                <div className="flex-1 space-y-2 mt-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-6" />
            <h3 className="text-lg font-semibold uppercase tracking-widest mb-2">Your Bag is Empty</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mb-8">
              Discover pieces made for your everyday wardrobe.
            </p>
            <Button 
              className="w-full uppercase tracking-widest text-xs h-12 rounded-none" 
              onClick={() => { setIsOpen(false); router.push('/shop'); }}
            >
              Explore Collection
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-8">
                {cart.items.map((item) => (
                  <div key={item.variantId} className="flex gap-5 group">
                    {/* Image */}
                    <div 
                      className="h-32 w-24 shrink-0 bg-muted overflow-hidden relative cursor-pointer"
                      onClick={() => { setIsOpen(false); router.push(`/products/${item.productId}`); }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 min-w-0 py-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link 
                            href={`/products/${item.productId}`} 
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight"
                          >
                            {item.name}
                          </Link>
                          <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{item.color}</span>
                            <span className="text-border/50">|</span>
                            <span>{item.size}</span>
                          </div>
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-border h-8">
                          <button
                            className="h-full w-8 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => cart.updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className="w-8 text-center text-xs font-semibold">
                            {item.quantity}
                          </div>
                          <button
                            className="h-full w-8 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => cart.updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button 
                          className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground hover:text-destructive transition-colors underline underline-offset-4"
                          onClick={() => cart.removeItem(item.variantId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 p-6 bg-muted/20">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Subtotal</span>
                <span className="text-base font-bold">৳{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full uppercase tracking-widest text-xs h-12 rounded-none font-bold" 
                  onClick={() => { setIsOpen(false); router.push('/checkout'); }}
                >
                  Checkout
                </Button>
                <Button 
                  variant="outline"
                  className="w-full uppercase tracking-widest text-xs h-12 rounded-none border-2 font-bold" 
                  onClick={() => { setIsOpen(false); router.push('/cart'); }}
                >
                  View Cart
                </Button>
              </div>
              
              <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">
                Shipping & taxes calculated at checkout
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
