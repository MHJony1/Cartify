"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, AlertCircle, Minus, Plus, Heart, Star, User, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useCartStore } from "@/features/cart/store/cart.store";
import { useCurrentUser } from "@/features/auth/hooks";
import { wishlistApi } from "@/features/wishlist/api/wishlist.api";
import { reviewsApi } from "@/features/reviews/api/reviews.api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { env } from "@/config/env";
import { Product } from "@/features/products/types";

// ----------------------------------------------------------------------
// Reviews Section
// ----------------------------------------------------------------------
function ReviewsSection({ productId }: { productId: string }) {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => reviewsApi.getProductReviews(productId, { limit: 10 }),
  });

  const createReviewMutation = useMutation({
    mutationFn: (payload: { productId: string; rating: number; comment: string }) => reviewsApi.createReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setComment("");
      setRating(5);
      setErrorMsg("");
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.message || "Failed to submit review");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createReviewMutation.mutate({ productId, rating, comment });
  };

  const reviews = reviewsResponse?.data || [];
  const total = reviewsResponse?.meta?.total || 0;
  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <div className="mt-24 pt-16 border-t border-border/50" id="reviews">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase">Customer Reviews</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`h-4 w-4 ${star <= Number(averageRating) ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <span className="text-sm font-medium">{averageRating} out of 5</span>
            <span className="text-sm text-muted-foreground">({total} Reviews)</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Reviews List */}
        <div className="lg:col-span-8 space-y-8">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-sm" />
              <Skeleton className="h-32 w-full rounded-sm" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center bg-muted/20 border border-border/50 rounded-sm">
              <p className="text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="pb-8 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {review.user.image ? <img src={review.user.image} className="w-full h-full object-cover" alt={review.user.name} /> : <User className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm uppercase tracking-wider text-foreground">{review.user.name}</p>
                        <div className="flex items-center mt-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground tracking-widest uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Write Review Form */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            {user ? (
              <div className="bg-muted/10 p-6 border border-border/50">
                <h3 className="font-bold text-sm uppercase tracking-widest mb-6 border-b border-border/50 pb-4">Write a Review</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm border border-destructive/20">
                      {errorMsg}
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest mb-3 block">Overall Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star className={`h-5 w-5 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest mb-3 block">Your Experience (Optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full border-0 border-b-2 border-border bg-transparent px-0 py-2 text-sm focus:outline-none focus:ring-0 focus:border-foreground h-20 resize-none transition-colors"
                      placeholder="What did you like or dislike?"
                    />
                  </div>
                  <Button type="submit" className="w-full uppercase tracking-widest font-semibold rounded-none h-12" disabled={createReviewMutation.isPending}>
                    {createReviewMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="bg-muted/10 p-8 text-center border border-border/50">
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Log in to your account to share your experience with this product.</p>
                <Button onClick={() => window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`} variant="outline" className="w-full uppercase tracking-widest font-semibold rounded-none h-12 border-2">
                  Sign In to Review
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Product Details Client Component
// ----------------------------------------------------------------------
export function ProductDetailsClient({ slug, initialData }: { slug: string, initialData?: Product | null }) {
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.getProductById(slug),
    initialData: initialData || undefined,
  });

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: user } = useCurrentUser();

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getMyWishlist,
    enabled: !!user,
  });

  const isWishlisted = product ? wishlist.some((item) => item.productId === product.id) : false;

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      if (isWishlisted) {
        return wishlistApi.removeFromWishlist(product.id);
      } else {
        return wishlistApi.addToWishlist(product.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleWishlistClick = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    toggleWishlistMutation.mutate();
  };

  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        const primary = product.images.find((img) => img.isPrimary) || product.images[0];
        setSelectedImage(primary.url);
      }
      if (product.variants && product.variants.length > 0) {
        setSelectedColor(product.variants[0].color);
        setSelectedSize(product.variants[0].size);
      }
    }
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.color)));
  }, [product]);

  const availableSizesForColor = useMemo(() => {
    if (!product?.variants || !selectedColor) return [];
    return Array.from(
      new Set(
        product.variants
          .filter((v) => v.color === selectedColor && v.stock > 0)
          .map((v) => v.size)
      )
    );
  }, [product, selectedColor]);

  const allSizes = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.size)));
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedColor || !selectedSize) return null;
    return product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  useEffect(() => {
    if (selectedColor && selectedSize) {
      const isSizeAvailable = product?.variants.some(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      if (!isSizeAvailable) {
        setSelectedSize(null);
        setQuantity(1);
      }
    }
  }, [selectedColor, product]);

  useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.stock) {
      setQuantity(Math.max(1, selectedVariant.stock));
    }
  }, [selectedVariant, quantity]);

  const addItemToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (allSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    
    if (!selectedVariant || !product) return;
    if (quantity > selectedVariant.stock) return;
    
    addItemToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: selectedImage || '',
      size: selectedVariant.size,
      color: selectedVariant.color,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      quantity: quantity,
      stock: selectedVariant.stock,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:w-20 shrink-0">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="w-20 h-24 rounded-none" />)}
            </div>
            <Skeleton className="w-full aspect-[3/4] rounded-none" />
          </div>
          <div className="space-y-6 pt-10">
            <Skeleton className="w-1/4 h-4" />
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/3 h-8" />
            <Skeleton className="w-full h-32 mt-10" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-6" />
        <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed from our catalog.</p>
        <Link href="/shop" className="inline-block">
          <Button variant="outline" className="uppercase tracking-widest font-semibold rounded-none h-12 px-8 border-2">
            Return to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const hasVariants = product.variants && product.variants.length > 0;
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayComparePrice = selectedVariant?.compareAtPrice;
  const stock = selectedVariant ? selectedVariant.stock : 0;
  const inStock = stock > 0;

  const getColorHex = (colorName: string) => {
    const colors: Record<string, string> = {
      'black': '#000000', 'white': '#ffffff', 'navy': '#000080', 
      'grey': '#808080', 'beige': '#f5f5dc', 'brown': '#a52a2a', 
      'red': '#ff0000', 'blue': '#0000ff', 'green': '#008000'
    };
    return colors[colorName.toLowerCase()] || '#cccccc';
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-[1400px]">
      
      {/* Breadcrumbs */}
      <nav className="flex text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-8">
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?categoryId=${product.categoryId}`} className="hover:text-foreground transition-colors">{product.category?.name || 'Category'}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* LEFT: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 lg:gap-6 items-start">
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto w-full md:w-20 lg:w-24 shrink-0 pb-2 md:pb-0 scrollbar-hide md:sticky md:top-24 snap-x">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative aspect-[3/4] w-20 md:w-full shrink-0 snap-start overflow-hidden transition-all ${
                    selectedImage === img.url ? "border-b-2 border-foreground opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img 
                    src={img.url.startsWith("http") ? img.url : `${env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")}${img.url.startsWith("/") ? "" : "/"}${img.url}`} 
                    alt={img.altText || product.name} 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden flex-1 group">
            {selectedImage ? (
              <img 
                src={selectedImage.startsWith("http") ? selectedImage : `${env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")}${selectedImage.startsWith("/") ? "" : "/"}${selectedImage}`} 
                alt={product.name} 
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground uppercase tracking-widest text-xs font-semibold">
                Image Unavailable
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Product Information (Sticky) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            
            {/* Header */}
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                {product.category?.name || 'Cartify Premium'}
              </p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mt-4">
                <span className="text-2xl font-bold text-foreground">৳{displayPrice.toLocaleString()}</span>
                {displayComparePrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ৳{displayComparePrice.toLocaleString()}
                  </span>
                )}
                {displayComparePrice && (
                  <span className="ml-2 text-xs font-bold uppercase tracking-widest text-destructive bg-destructive/10 px-2 py-1">
                    Save {Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {hasVariants ? (
              <div className="space-y-8 mb-10">
                
                {/* Color Swatches */}
                {availableColors.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Color</h3>
                      <span className="text-xs text-muted-foreground font-medium capitalize">{selectedColor}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {availableColors.map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            title={color}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isSelected ? "ring-1 ring-offset-2 ring-foreground" : "ring-1 ring-border hover:ring-muted-foreground"
                            }`}
                          >
                            <span 
                              className="w-full h-full rounded-full border border-black/10"
                              style={{ backgroundColor: getColorHex(color) }} 
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {allSizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-xs font-bold uppercase tracking-widest ${sizeError ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                        Size {selectedSize ? <span className="text-muted-foreground font-normal ml-2">— {selectedSize}</span> : sizeError ? <span className="text-destructive font-normal ml-2">— Please select a size</span> : <span className="text-destructive font-normal ml-2">— Required</span>}
                      </h3>
                      <button className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-4">
                        Size Guide
                      </button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {allSizes.map((size) => {
                        const isAvailable = availableSizesForColor.includes(size);
                        const isSelected = selectedSize === size;
                        
                        return (
                          <button
                            key={size}
                            onClick={() => {
                              if(isAvailable) {
                                setSelectedSize(size);
                                setSizeError(false);
                              }
                            }}
                            disabled={!isAvailable}
                            className={`flex items-center justify-center h-12 text-sm font-medium transition-all border ${
                              isSelected
                                ? "border-foreground bg-foreground text-background"
                                : isAvailable
                                ? sizeError ? "border-destructive/50 bg-destructive/5 hover:border-destructive hover:bg-destructive/10" : "border-input bg-background hover:border-foreground/50 hover:bg-accent"
                                : "border-muted bg-muted/30 text-muted-foreground cursor-not-allowed line-through decoration-muted-foreground/30"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SKU & Stock Info */}
                {selectedVariant && (
                  <div className="pt-6 border-t border-border/50 text-[11px] font-semibold uppercase tracking-widest flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU</span>
                      <span className="text-foreground">{selectedVariant.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Availability</span>
                      <span className={inStock ? "text-primary" : "text-destructive"}>
                        {inStock ? `${stock} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">Quantity</h3>
                  <div className="inline-flex items-center border border-input h-12">
                    <button
                      className="px-4 h-full flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || !inStock || !selectedVariant}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="w-12 text-center text-sm font-semibold">
                      {quantity}
                    </div>
                    <button
                      className="px-4 h-full flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      disabled={quantity >= stock || !inStock || !selectedVariant}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="mb-10 py-4 text-sm font-medium text-destructive border-y border-border/50">
                This product is currently unavailable (no variants configured).
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-10">
              <Button 
                size="lg" 
                className={`flex-1 rounded-none h-14 uppercase tracking-widest font-bold text-xs group transition-all ${sizeError ? 'ring-2 ring-destructive ring-offset-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
                disabled={(!selectedVariant && !allSizes.length) || !inStock}
                onClick={handleAddToCart}
              >
                <ShoppingBag className={`mr-2 h-4 w-4 ${sizeError ? 'animate-bounce' : 'group-active:scale-90 transition-transform'}`} />
                {sizeError ? "Select Size First" : inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className={`w-14 rounded-none h-14 border-2 transition-colors ${isWishlisted ? 'text-destructive border-destructive bg-destructive/5' : 'text-foreground border-input'}`} 
                onClick={handleWishlistClick}
                disabled={toggleWishlistMutation.isPending}
              >
                {toggleWishlistMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-destructive' : ''}`} />
                )}
                <span className="sr-only">{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </Button>
            </div>

            {/* Accordions */}
            <div className="border-t border-border">
              {/* Description */}
              <div className="border-b border-border">
                <button 
                  className="w-full flex items-center justify-between py-5 text-left focus:outline-none"
                  onClick={() => setOpenAccordion(openAccordion === 'description' ? null : 'description')}
                >
                  <span className="text-xs font-bold uppercase tracking-widest">Product Details</span>
                  {openAccordion === 'description' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'description' ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              </div>
              
              {/* Shipping */}
              <div className="border-b border-border">
                <button 
                  className="w-full flex items-center justify-between py-5 text-left focus:outline-none"
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                >
                  <span className="text-xs font-bold uppercase tracking-widest">Shipping & Returns</span>
                  {openAccordion === 'shipping' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'shipping' ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                  <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
                    <li>Complimentary shipping on orders over ৳5000.</li>
                    <li>Delivery within 2-3 business days inside Dhaka, 3-5 days outside.</li>
                    <li>14-day return policy for unused items in original packaging.</li>
                  </ul>
                </div>
              </div>

              {/* Materials */}
              <div className="border-b border-border">
                <button 
                  className="w-full flex items-center justify-between py-5 text-left focus:outline-none"
                  onClick={() => setOpenAccordion(openAccordion === 'materials' ? null : 'materials')}
                >
                  <span className="text-xs font-bold uppercase tracking-widest">Materials & Care</span>
                  {openAccordion === 'materials' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'materials' ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Designed for longevity. Machine wash cold with like colors. Do not bleach. Tumble dry low or hang to dry to preserve fabric integrity.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} />
    </div>
  );
}
