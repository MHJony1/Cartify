"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/features/cart/store/cart.store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const cart = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse w-full max-w-4xl h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Looks like you haven't added anything to your cart yet. Discover our latest collections and find something you love.
        </p>
        <Link href="/" className={buttonVariants({ size: "lg" })}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">{cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}</h2>
            <Button variant="ghost" size="sm" onClick={cart.clearCart} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              Clear Cart
            </Button>
          </div>
          
          <div className="flex flex-col gap-6">
            {cart.items.map((item) => (
              <div key={item.variantId} className="flex gap-4 sm:gap-6 pb-6 border-b border-border/50 relative">
                
                {/* Image */}
                <Link href={`/products/${item.productId}`} className="shrink-0">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-md bg-muted overflow-hidden border">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex flex-col flex-1 justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link href={`/products/${item.productId}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>Color: <span className="text-foreground">{item.color}</span></span>
                        <span>Size: <span className="text-foreground">{item.size}</span></span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground font-mono">
                        SKU: {item.sku}
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      ৳{(item.price * item.quantity).toLocaleString()}
                      <div className="text-xs text-muted-foreground mt-1 font-normal">
                        ৳{item.price.toLocaleString()} each
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center border rounded-md h-9 w-max">
                        <button
                          className="h-full w-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <div className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </div>
                        <button
                          className="h-full w-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {item.quantity >= item.stock && (
                        <span className="text-xs text-destructive">Max stock reached</span>
                      )}
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                      onClick={() => cart.removeItem(item.variantId)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-base">Total</span>
              <span className="font-bold text-xl">৳{subtotal.toLocaleString()}</span>
            </div>

            <Link href="/checkout" className={buttonVariants({ className: "w-full", size: "lg" })}>
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-primary hover:underline transition-all">
                or Continue Shopping
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
