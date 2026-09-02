"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/store/cart.store";
import { wishlistApi } from "@/features/wishlist/api/wishlist.api";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, Heart } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";
import { LoadingState } from "@/components/shared/LoadingState";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [movingToWishlist, setMovingToWishlist] = useState<string | null>(null);
  const cart = useCartStore();
  const router = useRouter();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-7xl mx-auto px-4 py-16 flex justify-center min-h-[60vh] items-center">
        <LoadingState />
      </div>
    );
  }

  const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleMoveToWishlist = async (variantId: string, productId: string) => {
    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }
    setMovingToWishlist(variantId);
    try {
      await wishlistApi.addToWishlist(productId);
      cart.removeItem(variantId);
    } catch (error) {
      console.error("Failed to move to wishlist", error);
    } finally {
      setMovingToWishlist(null);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-8" />
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-4">Your Bag is Empty</h1>
        <p className="text-muted-foreground max-w-sm mb-10 text-sm">
          Discover pieces made for your everyday wardrobe.
        </p>
        <Link href="/shop">
          <Button className="uppercase tracking-widest text-xs h-12 px-12 rounded-none font-bold">
            Explore Collection
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl mx-auto px-4 py-12 md:py-20 max-w-7xl">
      <div className="flex items-end justify-between mb-12 border-b border-border/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight uppercase">Shopping Bag</h1>
        <p className="text-muted-foreground font-medium">{cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* Left: Cart Items */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <div className="flex flex-col gap-10">
            {cart.items.map((item) => (
              <div key={item.variantId} className="flex gap-6 sm:gap-8 group">
                
                {/* Image (3:4 portrait) */}
                <div className="shrink-0">
                  <Link href={`/products/${item.productId}`}>
                    <div className="w-28 sm:w-40 aspect-[3/4] bg-muted relative overflow-hidden transition-colors hover:bg-muted/80">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground">No img</div>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link href={`/products/${item.productId}`} className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors leading-tight">
                        {item.name}
                      </Link>
                      <div className="mt-2 text-sm text-muted-foreground flex flex-col gap-1">
                        <span>Color: <span className="text-foreground">{item.color}</span></span>
                        <span>Size: <span className="text-foreground">{item.size}</span></span>
                      </div>
                      <div className="mt-4 text-[11px] uppercase tracking-widest text-muted-foreground">
                        Item: {item.sku}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="font-semibold sm:text-lg whitespace-nowrap">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                      {item.quantity > 1 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ৳{item.price.toLocaleString()} each
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4">
                    
                    {/* Quantity Controls */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center border border-border h-10 w-max">
                        <button
                          className="h-full w-10 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <div className="w-12 text-center text-sm font-semibold">
                          {item.quantity}
                        </div>
                        <button
                          className="h-full w-10 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {item.quantity >= item.stock && (
                        <span className="text-[10px] uppercase tracking-wider text-destructive font-medium">Limit reached</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 sm:gap-6">
                      <button 
                        onClick={() => handleMoveToWishlist(item.variantId, item.productId)}
                        disabled={movingToWishlist === item.variantId}
                        className="text-xs font-semibold uppercase tracking-widest flex items-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <Heart className="h-3.5 w-3.5 mr-2" />
                        {movingToWishlist === item.variantId ? 'Moving...' : 'Wishlist'}
                      </button>
                      <button 
                        onClick={() => cart.removeItem(item.variantId)}
                        className="text-xs font-semibold uppercase tracking-widest flex items-center text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Remove
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/40">
            <button 
              onClick={cart.clearCart}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors underline underline-offset-4"
            >
              Clear Bag
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4 mt-12 lg:mt-0">
          <div className="bg-muted/10 p-8 sticky top-28">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest">Estimated Total</span>
                <span className="font-bold text-xl">৳{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button className="w-full h-14 rounded-none uppercase tracking-widest text-xs font-bold">
                Proceed to Checkout
              </Button>
            </Link>
            
            <div className="mt-6 space-y-4">
              <p className="text-[11px] text-muted-foreground text-center uppercase tracking-wider leading-relaxed">
                Secure checkout • Easy Returns • Authentic Products
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
