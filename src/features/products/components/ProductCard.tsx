"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks';
import { wishlistApi } from '@/features/wishlist/api/wishlist.api';

export interface ProductCardProps {
  id: string;
  name: string;
  slug?: string;
  price?: number; // Base price or fallback
  originalPrice?: number;
  images?: { url: string }[];
  image?: string; // Keep for backward compatibility with mock data during transition
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
  rating,
  reviewCount,
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

  const displayImage = images && images.length > 0 ? images[0].url : image || '';
  const productLink = slug ? `/products/${slug}` : `/products/${id}`;

  return (
    <Card className="group relative overflow-hidden rounded-lg border-0 shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={productLink}>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            style={{ backgroundImage: `url(${displayImage})` }}
          />
        </Link>
        
        <div className="absolute left-2 top-2 flex flex-col gap-1 pointer-events-none">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground">New</Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive">
              {discount}% OFF
            </Badge>
          )}
          {badge && (
            <Badge variant="secondary">
              {badge}
            </Badge>
          )}
        </div>

        <div className={`absolute right-2 top-2 transition-opacity ${isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <Button 
            variant="secondary" 
            size="icon" 
            className={`h-8 w-8 rounded-full shadow-sm hover:text-destructive ${isWishlisted ? 'text-destructive bg-destructive/10' : ''}`}
            onClick={handleWishlistClick}
            disabled={toggleWishlistMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-destructive' : ''}`} />
            <span className="sr-only">{isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}</span>
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 w-full translate-y-full p-2 transition-transform duration-300 group-hover:translate-y-0">
          <Button className="w-full shadow-sm" size="sm">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-1 text-sm">
          {rating ? (
            <>
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="font-medium text-foreground">{rating}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs">No reviews</span>
          )}
        </div>
        
        <Link href={productLink} className="block">
          <h3 className="line-clamp-1 font-medium text-foreground hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">৳{displayPrice.toLocaleString()}</span>
          {displayOriginalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{displayOriginalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
