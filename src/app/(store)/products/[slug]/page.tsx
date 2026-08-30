"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { Product, ProductVariant } from "@/features/products/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, AlertCircle, Minus, Plus, Heart, Star, User } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/features/cart/store/cart.store";
import { useCurrentUser } from "@/features/auth/hooks";
import { wishlistApi } from "@/features/wishlist/api/wishlist.api";
import { reviewsApi } from "@/features/reviews/api/reviews.api";
import { useRouter } from "next/navigation";

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

  return (
    <div className="mt-16 pt-16 border-t border-border">
      <h2 className="text-2xl font-bold tracking-tight mb-8 text-foreground">Customer Reviews ({total})</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-border/50 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border">
                      {review.user.image ? <img src={review.user.image} className="rounded-full w-full h-full object-cover" alt={review.user.name} /> : <User className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{review.user.name}</p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-primary text-primary' : 'text-muted'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-muted-foreground text-sm mt-3">{review.comment}</p>}
              </div>
            ))
          )}
        </div>

        <div>
          {user ? (
            <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Write a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`h-6 w-6 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Comment (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                    placeholder="What did you like or dislike?"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createReviewMutation.isPending}>
                  {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl p-6 text-center border border-border/50">
              <p className="text-muted-foreground mb-4">Please log in to write a review.</p>
              <Button onClick={() => window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`} variant="outline" className="w-full">
                Log In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", resolvedParams?.slug],
    queryFn: () => productsApi.getProductById(resolvedParams!.slug),
    enabled: !!resolvedParams?.slug,
  });

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

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

  // Set initial selections when product loads
  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        // Find primary image or use first
        const primary = product.images.find((img) => img.isPrimary) || product.images[0];
        setSelectedImage(primary.url);
      }
      if (product.variants && product.variants.length > 0) {
        setSelectedColor(product.variants[0].color);
        setSelectedSize(product.variants[0].size);
      }
    }
  }, [product]);

  // Derived available options
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

  // Resolve selected variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedColor || !selectedSize) return null;
    return product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  // Ensure selected size is available for the new color, otherwise reset
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

  // Validate quantity against stock
  useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.stock) {
      setQuantity(Math.max(1, selectedVariant.stock));
    }
  }, [selectedVariant, quantity]);

  const addItemToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
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

  if (!resolvedParams || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="w-full aspect-square rounded-xl" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="w-20 h-20 rounded-md" />)}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="w-2/3 h-10" />
            <Skeleton className="w-1/3 h-8" />
            <Skeleton className="w-full h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-muted-foreground mt-2">The product you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const hasVariants = product.variants && product.variants.length > 0;
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayComparePrice = selectedVariant?.compareAtPrice;
  const stock = selectedVariant ? selectedVariant.stock : 0;
  const inStock = stock > 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Images Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted border">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                    selectedImage === img.url ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
                  }`}
                >
                  <img src={img.url} alt={img.altText || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>
          
          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-bold text-foreground">৳{displayPrice.toLocaleString()}</span>
            {displayComparePrice && (
              <span className="text-lg text-muted-foreground line-through mb-1">
                ৳{displayComparePrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-6 prose prose-sm sm:prose text-muted-foreground">
            <p>{product.description}</p>
          </div>

          {hasVariants ? (
            <div className="mt-8 space-y-6">
              
              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Color: <span className="text-muted-foreground">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-sm rounded-md border transition-all ${
                          selectedColor === color
                            ? "border-primary bg-primary/5 font-semibold text-primary"
                            : "border-input bg-background hover:bg-accent"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {allSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground">Size: {selectedSize ? <span className="text-muted-foreground">{selectedSize}</span> : <span className="text-destructive">Please select</span>}</h3>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {allSizes.map((size) => {
                      const isAvailable = availableSizesForColor.includes(size);
                      const isSelected = selectedSize === size;
                      
                      return (
                        <button
                          key={size}
                          onClick={() => isAvailable && setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`flex items-center justify-center h-10 rounded-md border text-sm transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground font-semibold"
                              : isAvailable
                              ? "border-input bg-background hover:bg-accent"
                              : "border-muted bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SKU & Stock */}
              {selectedVariant && (
                <div className="pt-4 border-t border-border/50 text-sm flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-mono">{selectedVariant.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Availability</span>
                    <span className={inStock ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                      {inStock ? `${stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                <h3 className="text-sm font-medium text-foreground">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || !inStock || !selectedVariant}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center text-sm font-medium">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none"
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      disabled={quantity >= stock || !inStock || !selectedVariant}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="mt-8 py-4 border-t border-b text-sm text-destructive">
              This product is currently unavailable (no variants configured).
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <Button 
              size="lg" 
              className="flex-1"
              disabled={!selectedVariant || !inStock}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className={`px-4 ${isWishlisted ? 'text-destructive bg-destructive/10 border-destructive/20' : ''}`} 
              onClick={handleWishlistClick}
              disabled={toggleWishlistMutation.isPending}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-destructive' : ''}`} />
              <span className="sr-only">{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
            </Button>
          </div>
          
        </div>
      </div>

      <ReviewsSection productId={product.id} />
    </div>
  );
}
