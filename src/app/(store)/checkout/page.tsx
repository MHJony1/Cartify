"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCartStore } from "@/features/cart/store/cart.store";
import { useCurrentUser } from "@/features/auth/hooks";
import { addressApi, Address } from "@/features/address/api/address.api";
import { couponApi } from "@/features/coupons/api/coupon.api";
import { ordersApi } from "@/features/orders/api/orders.api";
import { paymentApi } from "@/features/payment/api/payment.api";
import { cartApi } from "@/features/cart/api/cart.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, Plus, CreditCard, Wallet, Loader2 } from "lucide-react";
import Link from "next/link";
import { LoadingState } from "@/components/shared/LoadingState";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const cart = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);

  // Form states
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  
  // New Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "", phone: "", division: "", district: "", area: "", addressLine: "", postalCode: ""
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !isUserLoading && !user) {
      router.push(`/login?redirect=/checkout`);
    }
  }, [mounted, isUserLoading, user, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && cart.items.length === 0) {
      router.push(`/cart`);
    }
  }, [mounted, cart.items, router]);

  // Sync cart to backend
  useEffect(() => {
    const syncCart = async () => {
      if (mounted && user && cart.items.length > 0 && !syncComplete && !isSyncing) {
        setIsSyncing(true);
        try {
          await cartApi.clearCart();
          await Promise.all(
            cart.items.map(item => cartApi.addToCart({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity
            }))
          );
          setSyncComplete(true);
        } catch (error) {
          console.error("Failed to sync cart", error);
          // Non-blocking but warn user
        } finally {
          setIsSyncing(false);
        }
      }
    };
    syncCart();
  }, [mounted, user, cart.items, syncComplete, isSyncing]);

  // Fetch addresses
  const { data: addressesResponse, refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressApi.getMyAddresses,
    enabled: !!user,
  });
  const addresses = addressesResponse?.data || [];

  // Set default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Mutations
  const addAddressMutation = useMutation({
    mutationFn: addressApi.createAddress,
    onSuccess: (data) => {
      refetchAddresses();
      setIsAddingAddress(false);
      setSelectedAddressId(data.data.id);
      setNewAddress({ name: "", phone: "", division: "", district: "", area: "", addressLine: "", postalCode: "" });
    },
    onError: (err: any) => alert(err?.response?.data?.message || "Failed to add address"),
  });

  const applyCouponMutation = useMutation({
    mutationFn: couponApi.applyCoupon,
    onSuccess: (data) => {
      setAppliedCoupon({ code: couponCode, discount: data.data.discountAmount });
      setCouponError("");
    },
    onError: (err: any) => {
      setCouponError(err?.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.createOrder,
  });

  const createPaymentMutation = useMutation({
    mutationFn: paymentApi.createPayment,
  });

  const subtotal = useMemo(() => cart.items.reduce((total, item) => total + item.price * item.quantity, 0), [cart.items]);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discount);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return alert("Please select a shipping address");
    
    try {
      const orderResponse = await createOrderMutation.mutateAsync({
        items: cart.items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity
        })),
        addressId: selectedAddressId,
        ...(appliedCoupon && { couponCode: appliedCoupon.code }),
        paymentMethod,
      });

      await createPaymentMutation.mutateAsync({
        orderId: orderResponse.data.id,
        method: paymentMethod,
      });

      // Clear cart ONLY on complete success
      cart.clearCart();
      router.push(`/checkout/success?orderId=${orderResponse.data.id}`);

    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to place order. Please try again.");
    }
  };

  if (!mounted || isUserLoading || !user || cart.items.length === 0) {
    return <LoadingState fullScreen />;
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] mx-auto px-4 py-12 md:py-20 max-w-[1400px]">
      <h1 className="text-3xl font-bold tracking-tight uppercase mb-12 border-b border-border/40 pb-6">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-12">
          
          {/* Shipping Address */}
          <section>
            <h2 className="text-base font-bold uppercase tracking-widest mb-6 border-b border-foreground inline-block pb-1">1. Delivery Details</h2>
            
            {addresses.length > 0 && !isAddingAddress ? (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-4 p-5 border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-foreground' : 'border-border/50 hover:border-foreground/30'}`}>
                    <div className="pt-1">
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedAddressId === addr.id ? 'border-foreground' : 'border-muted-foreground'}`}>
                        {selectedAddressId === addr.id && <div className="h-2 w-2 rounded-full bg-foreground" />}
                      </div>
                      <input 
                        type="radio" 
                        name="address" 
                        className="hidden"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{addr.name}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {addr.addressLine}, {addr.area}, <br/>
                        {addr.district}, {addr.division} {addr.postalCode}
                      </p>
                      <p className="text-sm font-medium mt-2">{addr.phone}</p>
                    </div>
                  </label>
                ))}
                <button 
                  className="text-xs font-bold uppercase tracking-widest flex items-center text-muted-foreground hover:text-foreground transition-colors mt-6"
                  onClick={() => setIsAddingAddress(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Address
                </button>
              </div>
            ) : (
              <div className="bg-muted/10 p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest">Full Name</label><Input className="h-12 rounded-none border-border/50 bg-background" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest">Phone Number</label><Input className="h-12 rounded-none border-border/50 bg-background" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest">Address Line (Street, House)</label><Input className="h-12 rounded-none border-border/50 bg-background" value={newAddress.addressLine} onChange={e => setNewAddress({...newAddress, addressLine: e.target.value})} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest">Area / Thana</label><Input className="h-12 rounded-none border-border/50 bg-background" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest">District</label><Input className="h-12 rounded-none border-border/50 bg-background" value={newAddress.district} onChange={e => setNewAddress({...newAddress, district: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest">Division</label><Input className="h-12 rounded-none border-border/50 bg-background" value={newAddress.division} onChange={e => setNewAddress({...newAddress, division: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest">Postal Code</label><Input className="h-12 rounded-none border-border/50 bg-background" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} /></div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    className="uppercase tracking-widest text-xs h-12 px-8 rounded-none font-bold"
                    onClick={() => addAddressMutation.mutate(newAddress)} 
                    disabled={addAddressMutation.isPending || !newAddress.name || !newAddress.addressLine}
                  >
                    {addAddressMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Address"}
                  </Button>
                  {addresses.length > 0 && <Button variant="outline" className="uppercase tracking-widest text-xs h-12 px-8 rounded-none border-2 font-bold" onClick={() => setIsAddingAddress(false)}>Cancel</Button>}
                </div>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section>
            <h2 className="text-base font-bold uppercase tracking-widest mb-6 border-b border-foreground inline-block pb-1">2. Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex flex-col items-center justify-center p-8 border-2 cursor-pointer transition-all text-center ${paymentMethod === 'COD' ? 'border-foreground bg-foreground/5' : 'border-border/50 hover:border-foreground/30'}`}>
                <input type="radio" className="hidden" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <Wallet className={`h-8 w-8 mb-4 ${paymentMethod === 'COD' ? 'text-foreground' : 'text-muted-foreground'}`} />
                <span className="font-bold text-sm uppercase tracking-widest">Cash on Delivery</span>
                <span className="text-xs text-muted-foreground mt-2">Pay when you receive</span>
              </label>
              
              <label className={`flex flex-col items-center justify-center p-8 border-2 cursor-pointer transition-all text-center ${paymentMethod === 'ONLINE' ? 'border-foreground bg-foreground/5' : 'border-border/50 hover:border-foreground/30'}`}>
                <input type="radio" className="hidden" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} />
                <CreditCard className={`h-8 w-8 mb-4 ${paymentMethod === 'ONLINE' ? 'text-foreground' : 'text-muted-foreground'}`} />
                <span className="font-bold text-sm uppercase tracking-widest">Pay Online</span>
                <span className="text-xs text-muted-foreground mt-2">Cards & Mobile Banking</span>
              </label>
            </div>
          </section>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 xl:col-span-5">
          <div className="bg-muted/10 p-6 sm:p-8 sticky top-28 border border-border/30">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-8">Order Summary</h2>
            
            <div className="flex flex-col gap-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div key={item.variantId} className="flex gap-4 group">
                  <div className="h-24 w-20 shrink-0 bg-muted overflow-hidden relative">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    <div className="absolute top-0 right-0 bg-background/90 text-[10px] font-bold px-1.5 py-0.5 m-1 rounded-sm">
                      x{item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 text-sm flex flex-col justify-between py-1">
                    <div>
                      <div className="font-bold line-clamp-1 leading-tight">{item.name}</div>
                      <div className="text-muted-foreground text-xs mt-1.5">
                        {item.color} | {item.size}
                      </div>
                    </div>
                    <div className="font-semibold text-right">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-6 mb-6">
              <label className="text-xs font-bold uppercase tracking-widest mb-3 block">Promo Code</label>
              <div className="flex">
                <Input 
                  placeholder="Enter code" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  disabled={!!appliedCoupon}
                  className="h-12 rounded-none border-border/50 bg-background rounded-l-sm focus-visible:ring-0 focus-visible:border-foreground"
                />
                {!appliedCoupon ? (
                  <Button 
                    variant="outline" 
                    className="h-12 rounded-none rounded-r-sm border-y-2 border-r-2 border-l-0 uppercase tracking-widest font-bold text-xs px-6"
                    onClick={() => applyCouponMutation.mutate(couponCode)}
                    disabled={!couponCode || applyCouponMutation.isPending}
                  >
                    Apply
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    className="h-12 rounded-none rounded-r-sm uppercase tracking-widest font-bold text-xs px-6"
                    onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                  >
                    Remove
                  </Button>
                )}
              </div>
              {couponError && <p className="text-xs text-destructive mt-2 flex items-center font-medium"><AlertCircle className="h-3 w-3 mr-1" />{couponError}</p>}
              {appliedCoupon && <p className="text-xs text-green-600 mt-2 flex items-center font-medium"><Check className="h-3 w-3 mr-1" />Discount applied</p>}
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-৳{appliedCoupon.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Free</span>
              </div>
            </div>

            <div className="border-t border-border/50 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest">Total</span>
                <span className="font-bold text-2xl">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 rounded-none uppercase tracking-widest text-xs font-bold" 
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending || createPaymentMutation.isPending || !selectedAddressId || isSyncing}
            >
              {isSyncing ? "Syncing..." : createOrderMutation.isPending || createPaymentMutation.isPending ? "Processing..." : "Place Order"}
            </Button>
            
            <div className="mt-6 flex justify-center items-center">
              <Link href="/cart" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
