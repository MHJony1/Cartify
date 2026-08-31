"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, X, LogOut, Package, Heart as HeartIcon, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileNavigation } from './MobileNavigation';
import { useCartStore } from '@/features/cart/store/cart.store';
import { useCurrentUser, useLogout } from '@/features/auth/hooks';
import { productsApi } from '@/features/products/api/products.api';
import { Product } from '@/features/products/types';
import { MiniCart } from '@/features/cart/components/MiniCart';
import { Avatar } from '@/components/ui/avatar';

const MEGA_MENU = [
  {
    name: 'Men',
    href: '/shop?gender=Men',
    columns: [
      {
        title: 'Clothing',
        links: [
          { name: 'T-Shirts', href: '/shop?gender=Men&search=T-Shirts' },
          { name: 'Shirts', href: '/shop?gender=Men&search=Shirts' },
          { name: 'Pants', href: '/shop?gender=Men&search=Pants' },
          { name: 'Jackets', href: '/shop?gender=Men&search=Jackets' },
        ]
      },
      {
        title: 'Accessories',
        links: [
          { name: 'Watches', href: '/shop?gender=Men&search=Watches' },
          { name: 'Belts', href: '/shop?gender=Men&search=Belts' },
          { name: 'Wallets', href: '/shop?gender=Men&search=Wallets' },
        ]
      }
    ]
  },
  {
    name: 'Women',
    href: '/shop?gender=Women',
    columns: [
      {
        title: 'Clothing',
        links: [
          { name: 'Dresses', href: '/shop?gender=Women&search=Dresses' },
          { name: 'Tops', href: '/shop?gender=Women&search=Tops' },
          { name: 'Pants', href: '/shop?gender=Women&search=Pants' },
          { name: 'Jackets', href: '/shop?gender=Women&search=Jackets' },
        ]
      },
      {
        title: 'Accessories',
        links: [
          { name: 'Bags', href: '/shop?gender=Women&search=Bags' },
          { name: 'Jewelry', href: '/shop?gender=Women&search=Jewelry' },
        ]
      }
    ]
  },
  {
    name: 'Kids',
    href: '/shop?gender=Unisex',
    columns: [
      {
        title: 'Boys',
        links: [
          { name: 'Clothing', href: '/shop?gender=Unisex&search=Boys+Clothing' },
          { name: 'Shoes', href: '/shop?gender=Unisex&search=Boys+Shoes' },
        ]
      },
      {
        title: 'Girls',
        links: [
          { name: 'Clothing', href: '/shop?gender=Unisex&search=Girls+Clothing' },
          { name: 'Shoes', href: '/shop?gender=Unisex&search=Girls+Shoes' },
        ]
      }
    ]
  },
  {
    name: 'Accessories',
    href: '/shop?search=Accessories',
    columns: [
      {
        title: 'All Accessories',
        links: [
          { name: 'Bags & Backpacks', href: '/shop?search=Bags' },
          { name: 'Watches', href: '/shop?search=Watches' },
          { name: 'Sunglasses', href: '/shop?search=Sunglasses' },
          { name: 'Hats', href: '/shop?search=Hats' },
        ]
      }
    ]
  },
];

const SIMPLE_LINKS = [
  { name: 'New Arrivals', href: '/shop?sort=createdAt-desc' },
  { name: 'Sale', href: '/shop?search=Sale', className: 'text-destructive' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Sticky & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Cart Hydration & State
  const [isMounted, setIsMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const totalCartItems = isMounted ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

  // Auth State
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Account Dropdown State
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Search Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await productsApi.getProducts({ search: searchQuery, limit: 5 });
        setSearchResults(response.data || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside for Account dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-border' 
          : 'bg-background border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
          
          {/* LEFT: Mobile Menu & Logo */}
          <div className="flex items-center gap-4 lg:w-1/4">
            <div className="lg:hidden">
              <MobileNavigation />
            </div>
            <Link href="/" className="flex items-center gap-2 z-10" onClick={() => setIsSearchOpen(false)}>
              <span className="text-2xl font-black tracking-tighter uppercase">CARTIFY</span>
            </Link>
          </div>
          
          {/* CENTER: Desktop Navigation (Hidden during search) */}
          <nav className={`hidden lg:flex lg:w-2/4 justify-center h-full transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Mega Menu Items */}
            {MEGA_MENU.map((cat) => {
              const isActive = pathname.includes(cat.href);
              return (
                <div key={cat.name} className="group h-full flex items-center px-4">
                  <Link 
                    href={cat.href} 
                    className={`text-[13px] font-medium uppercase tracking-[0.1em] transition-colors relative 
                      ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
                    `}
                  >
                    {cat.name}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground" />
                    )}
                  </Link>
                  
                  {/* Dropdown Panel */}
                  <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out z-50">
                    <div className="container mx-auto px-4 lg:px-8 py-8 flex justify-between">
                      {/* Left: Link Columns */}
                      <div className="flex gap-16 lg:gap-24">
                        {cat.columns.map((col, idx) => (
                          <div key={idx} className="flex flex-col min-w-[120px]">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{col.title}</h4>
                            <ul className="flex flex-col gap-3">
                              {col.links.map((link, linkIdx) => (
                                <li key={linkIdx}>
                                  <Link 
                                    href={link.href} 
                                    className="text-sm font-medium text-foreground/80 hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200"
                                  >
                                    {link.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      
                      {/* Right: Featured / View All */}
                      <div className="hidden lg:flex flex-col justify-between w-64 border-l border-border/40 pl-10">
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Discover {cat.name}</h4>
                          <Link href={`${cat.href}&sort=createdAt-desc`} className="group flex items-center gap-4">
                            <div className="h-16 w-12 bg-muted flex items-center justify-center transition-colors group-hover:bg-foreground/5">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                            <div>
                              <p className="text-[13px] font-bold uppercase tracking-wider group-hover:text-primary transition-colors">New Arrivals</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Shop the latest</p>
                            </div>
                          </Link>
                        </div>
                        <div className="mt-6">
                          <Link href={cat.href} className="text-xs font-bold uppercase tracking-widest border-b border-foreground/30 hover:border-foreground pb-0.5 transition-colors">
                            View All {cat.name}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simple Links */}
            {SIMPLE_LINKS.map((link) => {
              const isActive = pathname.includes(link.href);
              return (
                <div key={link.name} className="h-full flex items-center px-4">
                  <Link 
                    href={link.href} 
                    className={`text-[13px] font-medium uppercase tracking-[0.1em] transition-colors relative 
                      ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
                      ${link.className || ''}
                    `}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* RIGHT: Utilities */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 lg:w-1/4">
            
            {/* Search Toggle / Input */}
            <div className="flex items-center">
              {isSearchOpen ? (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background px-4 lg:px-8 border-b border-border shadow-sm">
                  <div className="container mx-auto max-w-4xl w-full flex items-center gap-4 relative">
                    <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search for premium products, categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 text-lg rounded-none border-0 border-b-2 border-foreground/20 bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/50 shadow-none"
                      />
                      
                      {/* Search Results Dropdown */}
                      {searchQuery.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-4 bg-background border border-border shadow-2xl max-h-[70vh] overflow-y-auto">
                          {isSearching ? (
                            <div className="p-8 text-sm text-muted-foreground text-center animate-pulse tracking-widest uppercase">Searching...</div>
                          ) : searchResults.length > 0 ? (
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {searchResults.map(product => (
                                <Link 
                                  key={product.id} 
                                  href={`/products/${product.slug}`}
                                  className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors rounded-sm group/searchitem"
                                  onClick={() => setIsSearchOpen(false)}
                                >
                                  {product.images?.[0] ? (
                                    <div className="h-20 w-20 bg-muted shrink-0 overflow-hidden relative">
                                      <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover group-hover/searchitem:scale-105 transition-transform duration-500" />
                                    </div>
                                  ) : (
                                    <div className="h-20 w-20 bg-muted shrink-0 flex items-center justify-center">
                                      <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <p className="text-sm font-medium line-clamp-2 leading-snug">{product.name}</p>
                                    <p className="text-sm font-semibold mt-1">৳{product.price.toLocaleString()}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="p-12 text-sm text-muted-foreground text-center tracking-widest uppercase">No products found</div>
                          )}
                          
                          {searchResults.length > 0 && (
                            <div className="border-t p-4 bg-muted/10">
                              <button type="submit" className="w-full text-center text-sm font-semibold uppercase tracking-wider text-primary hover:underline underline-offset-4">
                                View all results
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </form>
                    <Button variant="ghost" size="icon" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="h-12 w-12 hover:bg-muted/50">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close Search</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-muted-foreground hover:text-foreground">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              )}
            </div>

            {/* Account */}
            <div className="relative" ref={accountRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex text-muted-foreground hover:text-foreground"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
              >
                {!isUserLoading && user ? (
                  <Avatar image={user.image} name={user.name} size="sm" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="sr-only">Account</span>
              </Button>
              
              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border shadow-xl py-2 z-50 rounded-sm">
                  {!isUserLoading && user ? (
                    <>
                      <div className="px-4 py-3 border-b border-border/50 mb-2 bg-muted/20">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center px-4 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => setIsAccountOpen(false)}>
                        <User className="mr-3 h-4 w-4 text-muted-foreground" /> Profile
                      </Link>
                      <Link href="/orders" className="flex items-center px-4 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => setIsAccountOpen(false)}>
                        <Package className="mr-3 h-4 w-4 text-muted-foreground" /> Orders
                      </Link>
                      <Link href="/wishlist" className="flex items-center px-4 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => setIsAccountOpen(false)}>
                        <HeartIcon className="mr-3 h-4 w-4 text-muted-foreground" /> Wishlist
                      </Link>
                      <Link href="/addresses" className="flex items-center px-4 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => setIsAccountOpen(false)}>
                        <MapPin className="mr-3 h-4 w-4 text-muted-foreground" /> Addresses
                      </Link>
                      <div className="border-t border-border/50 mt-2 pt-2">
                        <button 
                          className="flex w-full items-center px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          disabled={logoutMutation.isPending}
                          onClick={async () => {
                            await logoutMutation.mutateAsync();
                            setIsAccountOpen(false);
                            router.push('/login');
                          }}
                        >
                          <LogOut className="mr-3 h-4 w-4" /> {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="flex items-center px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors" onClick={() => setIsAccountOpen(false)}>
                        Sign In
                      </Link>
                      <Link href="/register" className="flex items-center px-4 py-2.5 text-sm hover:bg-muted transition-colors text-muted-foreground" onClick={() => setIsAccountOpen(false)}>
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>

            {/* Cart */}
            <MiniCart />
            
          </div>
        </div>
      </div>
    </header>
  );
}

