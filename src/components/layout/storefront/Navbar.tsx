"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, X, LogOut, Package, Heart as HeartIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileNavigation } from './MobileNavigation';
import { useCartStore } from '@/features/cart/store/cart.store';
import { useCurrentUser } from '@/features/auth/hooks';
import { productsApi } from '@/features/products/api/products.api';
import { Product } from '@/features/products/types';

const MEGA_MENU = [
  {
    name: 'Men',
    href: '/categories/men',
    columns: [
      {
        title: 'Clothing',
        links: [
          { name: 'T-Shirts', href: '/categories/men-tshirts' },
          { name: 'Shirts', href: '/categories/men-shirts' },
          { name: 'Pants', href: '/categories/men-pants' },
          { name: 'Jackets', href: '/categories/men-jackets' },
        ]
      },
      {
        title: 'Accessories',
        links: [
          { name: 'Watches', href: '/categories/men-watches' },
          { name: 'Belts', href: '/categories/men-belts' },
          { name: 'Wallets', href: '/categories/men-wallets' },
        ]
      }
    ]
  },
  {
    name: 'Women',
    href: '/categories/women',
    columns: [
      {
        title: 'Clothing',
        links: [
          { name: 'Dresses', href: '/categories/women-dresses' },
          { name: 'Tops', href: '/categories/women-tops' },
          { name: 'Pants', href: '/categories/women-pants' },
          { name: 'Jackets', href: '/categories/women-jackets' },
        ]
      },
      {
        title: 'Accessories',
        links: [
          { name: 'Bags', href: '/categories/women-bags' },
          { name: 'Jewelry', href: '/categories/women-jewelry' },
        ]
      }
    ]
  },
  {
    name: 'Kids',
    href: '/categories/kids',
    columns: [
      {
        title: 'Boys',
        links: [
          { name: 'Clothing', href: '/categories/boys-clothing' },
          { name: 'Shoes', href: '/categories/boys-shoes' },
        ]
      },
      {
        title: 'Girls',
        links: [
          { name: 'Clothing', href: '/categories/girls-clothing' },
          { name: 'Shoes', href: '/categories/girls-shoes' },
        ]
      }
    ]
  },
  {
    name: 'Accessories',
    href: '/categories/accessories',
    columns: [
      {
        title: 'All Accessories',
        links: [
          { name: 'Bags & Backpacks', href: '/categories/bags' },
          { name: 'Watches', href: '/categories/watches' },
          { name: 'Sunglasses', href: '/categories/sunglasses' },
          { name: 'Hats', href: '/categories/hats' },
        ]
      }
    ]
  },
];

const SIMPLE_LINKS = [
  { name: 'New Arrivals', href: '/categories/new-arrivals' },
  { name: 'Sale', href: '/categories/sale', className: 'text-destructive' },
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
                  <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="container mx-auto px-8 py-10 flex gap-20">
                      {cat.columns.map((col, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">{col.title}</h4>
                          <ul className="flex flex-col gap-3">
                            {col.links.map((link, linkIdx) => (
                              <li key={linkIdx}>
                                <Link 
                                  href={link.href} 
                                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center group/link"
                                >
                                  <span className="transform -translate-x-2 opacity-0 group-hover/link:translate-x-0 group-hover/link:opacity-100 transition-all duration-200">
                                    <ChevronRight className="h-3 w-3 mr-1" />
                                  </span>
                                  {link.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      
                      {/* Optional Highlight/Promo block inside Mega Menu */}
                      <div className="ml-auto w-1/3 bg-muted/30 p-6 flex flex-col justify-end">
                        <div className="aspect-[16/9] bg-muted mb-4 overflow-hidden relative group/promo">
                           <div className="absolute inset-0 bg-black/10 group-hover/promo:bg-black/20 transition-colors z-10" />
                           {/* Placeholder for promotional image */}
                           <div className="w-full h-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium uppercase tracking-widest text-sm">
                              {cat.name} Collection
                           </div>
                        </div>
                        <h5 className="font-semibold text-lg mb-1">Discover {cat.name}</h5>
                        <Link href={cat.href} className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors">
                          Shop Now
                        </Link>
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
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
              
              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border shadow-xl py-2 z-50 rounded-sm">
                  {!isUserLoading && user ? (
                    <>
                      <div className="px-4 py-3 border-b border-border/50 mb-2 bg-muted/20">
                        <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
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
                      <div className="border-t border-border/50 mt-2 pt-2">
                        <button 
                          className="flex w-full items-center px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => {
                            setIsAccountOpen(false);
                            localStorage.removeItem('cartify_token'); 
                            window.location.href = '/login';
                          }}
                        >
                          <LogOut className="mr-3 h-4 w-4" /> Sign out
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
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <ShoppingBag className="h-5 w-5" />
                {isMounted && totalCartItems > 0 && (
                  <Badge variant="default" className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full p-0 text-[10px] bg-primary text-primary-foreground border-background border-2 font-bold shadow-sm">
                    {totalCartItems}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            
          </div>
        </div>
      </div>
    </header>
  );
}

