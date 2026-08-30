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
import { Separator } from "@/components/ui/separator";
import { AlertCircle, MapPin, CreditCard, ChevronRight, Check } from "lucide-react";

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

  // Sync cart to backend to satisfy Coupon API constraints
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
          alert("Failed to synchronize cart. Coupon application might fail.");
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
      // 1. Create Order
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

      // 2. Create Payment Record
      await createPaymentMutation.mutateAsync({
        orderId: orderResponse.data.id,
        method: paymentMethod,
      });

      // 3. Clear cart ONLY on complete success
      cart.clearCart();
      
      // 4. Redirect to success page
      router.push(`/checkout/success?orderId=${orderResponse.data.id}`);

    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to place order. Please try again.");
    }
  };

  if (!mounted || isUserLoading || !user || cart.items.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse w-32 h-32 bg-muted rounded-full" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Details */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Shipping Address */}
          <section className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Shipping Address
            </h2>
            
            {addresses.length > 0 && !isAddingAddress ? (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <input 
                      type="radio" 
                      name="address" 
                      className="mt-1"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <div>
                      <p className="font-medium text-foreground">{addr.name} - {addr.phone}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {addr.addressLine}, {addr.area}, {addr.district}, {addr.division} - {addr.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
                <Button variant="outline" onClick={() => setIsAddingAddress(true)}>Add New Address</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Division</label><Input value={newAddress.division} onChange={e => setNewAddress({...newAddress, division: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">District</label><Input value={newAddress.district} onChange={e => setNewAddress({...newAddress, district: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Area</label><Input value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Postal Code</label><Input value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium">Address Line</label><Input value={newAddress.addressLine} onChange={e => setNewAddress({...newAddress, addressLine: e.target.value})} /></div>
                
                <div className="flex gap-4 pt-2">
                  <Button 
                    onClick={() => addAddressMutation.mutate(newAddress)} 
                    disabled={addAddressMutation.isPending || !newAddress.name || !newAddress.addressLine}
                  >
                    {addAddressMutation.isPending ? "Saving..." : "Save Address"}
                  </Button>
                  {addresses.length > 0 && <Button variant="ghost" onClick={() => setIsAddingAddress(false)}>Cancel</Button>}
                </div>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </h2>
            <div className="space-y-4">
              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <span className="font-medium">Cash on Delivery (COD)</span>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'ONLINE' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                <input type="radio" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} />
                <span className="font-medium">Pay Online (Card/Mobile Banking)</span>
              </label>
            </div>
          </section>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 mb-6 max-h-80 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 rounded-md bg-muted border overflow-hidden">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm flex flex-col justify-between">
                    <div className="font-medium line-clamp-1">{item.name}</div>
                    <div className="text-muted-foreground flex gap-2">
                      <span>{item.color}</span> / <span>{item.size}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Coupon */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Discount Code</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter code" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  disabled={!!appliedCoupon}
                />
                {!appliedCoupon ? (
                  <Button 
                    variant="secondary" 
                    onClick={() => applyCouponMutation.mutate(couponCode)}
                    disabled={!couponCode || applyCouponMutation.isPending}
                  >
                    Apply
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}>
                    Remove
                  </Button>
                )}
              </div>
              {couponError && <p className="text-sm text-destructive mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{couponError}</p>}
              {appliedCoupon && <p className="text-sm text-green-600 mt-1 flex items-center gap-1"><Check className="h-3 w-3" />Coupon applied successfully</p>}
            </div>

            <div className="space-y-3 text-sm">
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

            <Separator className="my-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-2xl text-primary">৳{total.toLocaleString()}</span>
            </div>

            <Button 
              className="w-full h-12 text-lg" 
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending || createPaymentMutation.isPending || !selectedAddressId || isSyncing}
            >
              {isSyncing ? "Syncing Cart..." : createOrderMutation.isPending || createPaymentMutation.isPending ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
