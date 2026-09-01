"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks';
import { wishlistApi } from '@/features/wishlist/api/wishlist.api';
import { env } from '@/config/env';

export interface ProductCardProps {
  id: string;
  name: string;
  slug?: string;
  price?: number;
  originalPrice?: number;
  images?: { url: string }[];
  image?: string; 
  variants?: { price: number; compareAtPrice?: number | null }[];
  rating?: number;
  reviewCount?: number;
  badge?: string;
  isNew?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  originalPrice,
  images,
  image,
  variants,
  badge,
  isNew,
}: ProductCardProps) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getMyWishlist,
    enabled: !!user,
  });

  const isWishlisted = wishlist.some((item) => item.productId === id);

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        return wishlistApi.removeFromWishlist(id);
      } else {
        return wishlistApi.addToWishlist(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    toggleWishlistMutation.mutate();
  };

  // Determine display price from variants (lowest price) or fallback to base price
  let displayPrice = price || 0;
  let displayOriginalPrice = originalPrice;

  if (variants && variants.length > 0) {
    const lowestVariant = variants.reduce((min, v) => (v.price < min.price ? v : min), variants[0]);
    displayPrice = lowestVariant.price;
    displayOriginalPrice = lowestVariant.compareAtPrice || undefined;
  }

  const discount = displayOriginalPrice ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100) : 0;

  const getFormattedImage = (rawUrl: string | undefined) => {
    if (!rawUrl) return "https://placehold.co/400x533?text=No+Image";
    if (rawUrl.startsWith("http")) return rawUrl;
    const baseUrl = env.NEXT_PUBLIC_API_URL.replace("/api/v1", "");
    return `${baseUrl}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
  };

  const displayImage1 = getFormattedImage(images && images.length > 0 ? images[0].url : image);
  const displayImage2 = getFormattedImage(images && images.length > 1 ? images[1].url : (images && images.length > 0 ? images[0].url : image));
  const productLink = slug ? `/products/${slug}` : `/products/${id}`;

  return (
    <div className="group relative flex flex-col w-full h-full">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted mb-4 rounded-sm">
        <Link href={productLink} className="block w-full h-full">
          {/* Primary Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out opacity-100 group-hover:opacity-0"
            style={{ backgroundImage: `url(${displayImage1})` }}
          />
          {/* Hover Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
            style={{ backgroundImage: `url(${displayImage2})` }}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 pointer-events-none z-10">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground uppercase tracking-widest text-[10px] font-bold rounded-none px-2 py-0.5">New</Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive" className="uppercase tracking-widest text-[10px] font-bold rounded-none px-2 py-0.5 bg-red-600">
              -{discount}%
            </Badge>
          )}
          {badge && (
            <Badge variant="secondary" className="uppercase tracking-widest text-[10px] font-bold rounded-none px-2 py-0.5">
              {badge}
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className={`absolute right-2 top-2 z-10 transition-opacity duration-300 ${isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <Button 
            variant="secondary" 
            size="icon" 
            className={`h-8 w-8 rounded-full shadow-sm hover:text-destructive hover:bg-white bg-white/90 border-transparent ${isWishlisted ? 'text-destructive bg-white' : 'text-muted-foreground'}`}
            onClick={handleWishlistClick}
            disabled={toggleWishlistMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`} />
            <span className="sr-only">{isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}</span>
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 px-1">
        <Link href={productLink} className="block mb-1">
          <h3 className="text-sm font-semibold text-foreground tracking-tight line-clamp-1 group-hover:underline underline-offset-4 decoration-1">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-sm font-medium text-foreground">৳{displayPrice.toLocaleString()}</span>
          {displayOriginalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ৳{displayOriginalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

