"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";
import { Product, ProductVariant } from "@/features/products/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, AlertCircle, Minus, Plus, Heart } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/features/cart/store/cart.store";

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

    alert('Added to Cart!');
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
    <div className="container mx-auto px-4 py-8 md:py-16">
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
            <Button size="lg" variant="outline" className="px-4" onClick={() => alert('Added to Wishlist!')}>
              <Heart className="h-5 w-5" />
              <span className="sr-only">Add to Wishlist</span>
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
