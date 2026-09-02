"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, X, LogOut, Package, Heart as HeartIcon, MapPin, Bell, LayoutDashboard, Loader2, ChevronRight, Store, Shirt, Watch, Wallet, Gem, Footprints, Tag, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/ui/Logo';
import { MobileNavigation } from './MobileNavigation';
import { useCartStore } from '@/features/cart/store/cart.store';
import { useCurrentUser, useLogout } from '@/features/auth/hooks';
import { productsApi } from '@/features/products/api/products.api';
import { Product } from '@/features/products/types';
import { MiniCart } from '@/features/cart/components/MiniCart';
import { Avatar } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/features/notifications/api/notifications.api';

const MEGA_MENU = [
  {
    name: 'Men',
    href: '/shop?gender=Men',
    columns: [
      {
        title: "Men's Wear",
        links: [
          { name: 'T-Shirts', href: '/shop?gender=Men&search=T-Shirts' },
          { name: 'Shirts', href: '/shop?gender=Men&search=Shirts' },
          { name: 'Jackets', href: '/shop?gender=Men&search=Jackets' },
          { name: 'Trousers', href: '/shop?gender=Men&search=Trousers' },
          { name: 'Jeans', href: '/shop?gender=Men&search=Jeans' },
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
        title: "Women's Wear",
        links: [
          { name: 'Dresses', href: '/shop?gender=Women&search=Dresses' },
          { name: 'Tops', href: '/shop?gender=Women&search=Tops' },
          { name: 'Skirts', href: '/shop?gender=Women&search=Skirts' },
          { name: 'Jackets', href: '/shop?gender=Women&search=Jackets' },
          { name: 'Jeans', href: '/shop?gender=Women&search=Jeans' },
        ]
      },
      {
        title: 'Accessories',
        links: [
          { name: 'Bags', href: '/shop?gender=Women&search=Bags' },
          { name: 'Jewelry', href: '/shop?gender=Women&search=Jewelry' },
          { name: 'Belts', href: '/shop?gender=Women&search=Belts' },
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
          { name: 'T-Shirts', href: '/shop?gender=Unisex&search=Boys+T-Shirts' },
          { name: 'Jeans', href: '/shop?gender=Unisex&search=Boys+Jeans' },
          { name: 'Shoes', href: '/shop?gender=Unisex&search=Boys+Shoes' },
        ]
      },
      {
        title: 'Girls',
        links: [
          { name: 'Dresses', href: '/shop?gender=Unisex&search=Girls+Dresses' },
          { name: 'Tops', href: '/shop?gender=Unisex&search=Girls+Tops' },
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
        title: 'Essentials',
        links: [
          { name: 'Bags & Backpacks', href: '/shop?search=Bags' },
          { name: 'Watches', href: '/shop?search=Watches' },
          { name: 'Jewelry', href: '/shop?search=Jewelry' },
          { name: 'Belts & Wallets', href: '/shop?search=Belts' },
          { name: 'Hats & Caps', href: '/shop?search=Hats' },
        ]
      }
    ]
  },
  {
    name: 'Sale',
    href: '/shop?sale=true',
    columns: [
      {
        title: 'Offers',
        links: [
          { name: 'All Sale', href: '/shop?sale=true' },
          { name: 'Men\'s Sale', href: '/shop?gender=Men&sale=true' },
          { name: 'Women\'s Sale', href: '/shop?gender=Women&sale=true' },
        ]
      }
    ]
  },
];

const getCategoryIcon = (name: string, className: string) => {
  const n = name.toLowerCase();
  if (n.includes('shirt') || n.includes('top') || n.includes('jacket') || n.includes('dress')) return <Shirt className={className} />;
  if (n.includes('watch')) return <Watch className={className} />;
  if (n.includes('wallet')) return <Wallet className={className} />;
  if (n.includes('bag')) return <ShoppingBag className={className} />;
  if (n.includes('belt')) return <Briefcase className={className} />;
  if (n.includes('jewelry')) return <Gem className={className} />;
  if (n.includes('shoe')) return <Footprints className={className} />;
  return <Tag className={className} />;
};

const getPromoContent = (catName: string) => {
  switch (catName) {
    case 'Men': return { title: 'New this week', desc: 'Fresh styles just landed. Upgrade your rotation.', link: '/shop?gender=Men&sort=new' };
    case 'Women': return { title: 'Summer Collection', desc: 'Breezy styles for warm days ahead.', link: '/shop?gender=Women&sort=new' };
    case 'Kids': return { title: 'Back to School', desc: 'Durable and stylish essentials for kids.', link: '/shop?gender=Unisex' };
    case 'Accessories': return { title: 'Finishing Touches', desc: 'Elevate your look with our new arrivals.', link: '/shop?search=Accessories&sort=new' };
    case 'Sale': return { title: 'Clearance Event', desc: 'Up to 70% off selected styles.', link: '/shop?sale=true' };
    default: return { title: 'New Arrivals', desc: 'Check out the latest additions.', link: '/shop?sort=new' };
  }
};

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
  
  const { data: unreadNotificationsCount } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: !!user && !isUserLoading,
    refetchInterval: 30000,
  });

  // Featured Products for Mega Menu
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['mega-menu-featured'],
    queryFn: async () => {
      const res = await productsApi.getProducts({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' });
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

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

  // Keyboard shortcut to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAccountOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header 
      className="fixed top-0 w-full z-50 flex flex-col transition-all duration-300 group/header"
    >
      {/* Announcement Bar */}
      <div className={`bg-zinc-950 text-zinc-100 flex items-center justify-center text-[10px] sm:text-[11px] font-medium tracking-[0.15em] transition-all overflow-hidden ${
        isScrolled ? 'h-0 opacity-0' : 'h-[34px] opacity-100'
      }`}>
        FREE SHIPPING ON ORDERS OVER $100 &nbsp;&bull;&nbsp; EASY 30-DAY RETURNS
      </div>

      {/* Main Navbar */}
      <div className={`w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-background shadow-sm border-b border-border' 
          : 'bg-background border-b border-border/40'
      }`}>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-[64px]' : 'h-[72px]'}`}>
          
          {/* LEFT: Mobile Menu & Logo */}
          <div className="flex items-center gap-4 lg:w-[200px] shrink-0">
            <div className="lg:hidden">
              <MobileNavigation />
            </div>
            <Logo className="py-2" />
          </div>
          
          {/* CENTER: Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center h-full">
            {MEGA_MENU.map((cat) => {
              const isActive = pathname.includes(cat.href) || pathname === cat.href;
              return (
                <div key={cat.name} className="group/navitem h-full flex items-center">
                  <Link 
                    href={cat.href} 
                    className={`px-5 text-[13px] font-[650] uppercase tracking-[0.06em] transition-colors relative h-full flex items-center
                      ${isActive 
                        ? 'text-rose-600' 
                        : (cat.name === 'Sale' ? 'text-rose-500 hover:text-rose-600' : 'text-foreground/90 hover:text-rose-600')}
                    `}
                  >
                    {cat.name}
                    <span className={`absolute bottom-[10px] left-1/2 -translate-x-1/2 h-[2.5px] rounded-full bg-rose-600 transition-all duration-300 ease-out 
                      ${isActive ? 'w-5' : 'w-0 group-hover/navitem:w-3'}
                    `} />
                  </Link>
                  
                  {/* Dropdown Panel - Centered Floating Style */}
                  <div className="absolute top-full left-0 w-full flex justify-center opacity-0 invisible -translate-y-2 group-hover/navitem:translate-y-0 group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all duration-200 ease-out z-50 pointer-events-none">
                    <div className="w-full max-w-[1100px] mx-4 bg-background shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-border/40 rounded-xl overflow-hidden pointer-events-auto">
                      <div className="flex bg-background">
                        
                        {/* Left: Link Columns (takes up remaining space) */}
                        <div className="flex-1 py-8 px-10 flex gap-10 xl:gap-14">
                          {cat.columns.map((col, idx) => (
                            <div key={idx} className="flex flex-col min-w-[120px]">
                              <h4 className="text-[10px] font-medium uppercase tracking-[0.07em] text-muted-foreground mb-5">{col.title}</h4>
                              <ul className="flex flex-col gap-1.5">
                                {col.links.map((link, linkIdx) => (
                                  <li key={linkIdx}>
                                    <Link 
                                      href={link.href} 
                                      className="group/link flex items-center gap-3 p-1.5 -ml-1.5 rounded-md hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="h-[30px] w-[30px] rounded-[6px] bg-muted/60 flex items-center justify-center shrink-0 text-muted-foreground/70 group-hover/link:text-rose-600 transition-colors">
                                        {getCategoryIcon(link.name, "h-4 w-4")}
                                      </div>
                                      <span className="text-[13px] font-medium text-muted-foreground group-hover/link:text-foreground group-hover/link:font-[650] transition-all">
                                        {link.name}
                                      </span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              {idx === cat.columns.length - 1 && (
                                (() => {
                                  const promo = getPromoContent(cat.name);
                                  return (
                                    <div className="mt-8 p-4 rounded-lg bg-rose-50/50 border border-rose-100/50">
                                      <h5 className="text-[11px] font-bold text-rose-900 uppercase tracking-wider mb-1">{promo.title}</h5>
                                      <p className="text-xs text-rose-800/70 mb-3 leading-snug">{promo.desc}</p>
                                      <Link href={promo.link} className="text-xs font-semibold text-rose-600 flex items-center hover:text-rose-700 group/promo">
                                        Shop now <ChevronRight className="h-3 w-3 ml-0.5 group-hover/promo:translate-x-0.5 transition-transform" />
                                      </Link>
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Right: Featured Products (Fixed width block) */}
                        <div className="hidden lg:block w-[320px] bg-muted/10 p-8 border-l border-border/40">
                          <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-foreground mb-4">Featured</h4>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                            {isFeaturedLoading ? (
                              Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="space-y-2.5">
                                  <Skeleton className="aspect-[4/5] w-full rounded-sm" />
                                  <Skeleton className="h-3 w-3/4" />
                                </div>
                              ))
                            ) : featuredProducts && featuredProducts.length > 0 ? (
                              featuredProducts.slice(0, 2).map((product) => (
                                <Link key={product.id} href={`/products/${product.slug}`} className="group/featured block">
                                  <div className="aspect-[4/5] bg-muted mb-2.5 overflow-hidden rounded-sm relative">
                                    {product.images?.[0] ? (
                                      <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/featured:scale-105" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="h-5 w-5 text-muted-foreground/30" />
                                      </div>
                                    )}
                                  </div>
                                  <h5 className="text-[12px] font-semibold line-clamp-1 group-hover/featured:text-rose-600 transition-colors text-foreground/90 mt-1">{product.name}</h5>
                                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">৳{product.price.toLocaleString()}</p>
                                </Link>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground col-span-2">No featured products.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom action bar */}
                      <div className="border-t border-border/40 px-10 py-4 mt-auto">
                        <Link href={cat.href} className="text-[11px] font-bold text-foreground hover:text-rose-600 uppercase tracking-[0.1em] transition-colors inline-flex items-center group/explore">
                          Explore All {cat.name} <ChevronRight className="ml-1 h-3.5 w-3.5 group-hover/explore:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* RIGHT: Search & Utilities */}
          <div className="flex items-center justify-end gap-6 lg:w-[450px] shrink-0">
            
            {/* Desktop Search Bar */}
            <div className="hidden lg:block relative w-48 xl:w-56">
              <form onSubmit={handleSearchSubmit}>
                <Input
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-10 text-sm bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border focus-visible:ring-1 focus-visible:ring-ring rounded-sm transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="flex items-center gap-5 xl:gap-7">

              {/* Account */}
              <div className="relative" ref={accountRef}>
                <button 
                  className="hidden sm:flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground group/icon focus:outline-none"
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                >
                  {(!isUserLoading && user) ? (
                    <Avatar image={user.image} name={user.name} size="sm" className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5 group-hover/icon:scale-110 transition-transform" strokeWidth={1.5} />
                  )}
                  <span className="text-[11px] font-medium leading-none">Profile</span>
                </button>
                
                {isAccountOpen && (
                  <div className="absolute right-1/2 translate-x-1/2 mt-4 w-64 bg-background border border-border shadow-xl z-50 rounded-sm overflow-hidden">
                    {!isUserLoading && user ? (
                      <>
                        <div className="px-5 py-4 border-b border-border/50 bg-muted/10">
                          <p className="text-sm font-bold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-1">{user.email}</p>
                        </div>
                        <div className="py-2">
                          <Link href="/profile" className="flex items-center px-5 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors" onClick={() => setIsAccountOpen(false)}>
                            <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" /> Dashboard
                          </Link>
                          <Link href="/orders" className="flex items-center px-5 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors" onClick={() => setIsAccountOpen(false)}>
                            <Package className="mr-3 h-4 w-4 text-muted-foreground" /> Orders
                          </Link>
                          <Link href="/wishlist" className="flex items-center px-5 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors" onClick={() => setIsAccountOpen(false)}>
                            <HeartIcon className="mr-3 h-4 w-4 text-muted-foreground" /> Wishlist
                          </Link>
                          <Link href="/addresses" className="flex items-center px-5 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors" onClick={() => setIsAccountOpen(false)}>
                            <MapPin className="mr-3 h-4 w-4 text-muted-foreground" /> Addresses
                          </Link>
                          <Link href="/profile/settings" className="flex items-center px-5 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors" onClick={() => setIsAccountOpen(false)}>
                            <User className="mr-3 h-4 w-4 text-muted-foreground" /> Settings
                          </Link>
                          
                          {user.role === 'ADMIN' && (
                            <>
                              <div className="border-t border-border/50 my-2"></div>
                              <Link href="/admin/dashboard" className="flex items-center px-5 py-2.5 text-sm font-semibold hover:bg-muted/50 transition-colors text-rose-500" onClick={() => setIsAccountOpen(false)}>
                                <LayoutDashboard className="mr-3 h-4 w-4" /> Admin Dashboard
                              </Link>
                            </>
                          )}
                        </div>
                        
                        <div className="border-t border-border/50 p-2 bg-muted/5">
                          <button 
                            className="flex w-full items-center px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-sm transition-colors disabled:opacity-50"
                            disabled={logoutMutation.isPending}
                            onClick={async () => {
                              await logoutMutation.mutateAsync();
                              setIsAccountOpen(false);
                              router.push('/login');
                            }}
                          >
                            {logoutMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <LogOut className="mr-2 h-4 w-4" />
                            )}
                            Sign out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 flex flex-col gap-3">
                        <Link href="/login" onClick={() => setIsAccountOpen(false)}>
                          <Button className="w-full text-xs font-bold uppercase tracking-wider h-10 rounded-sm">Sign In</Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsAccountOpen(false)}>
                          <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider h-10 rounded-sm">Create Account</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className="hidden sm:flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground group/icon">
                <Heart className="h-5 w-5 group-hover/icon:scale-110 transition-transform" strokeWidth={1.5} />
                <span className="text-[11px] font-medium leading-none">Wishlist</span>
              </Link>

              {/* Notifications */}
              <Link href="/notifications" className="hidden sm:flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground group/icon">
                <div className="relative">
                  <Bell className="h-5 w-5 group-hover/icon:scale-110 transition-transform" strokeWidth={1.5} />
                  {(() => {
                    const count = typeof unreadNotificationsCount === 'object' ? (unreadNotificationsCount as any).count : unreadNotificationsCount;
                    if (!count || count === 0) return null;
                    return (
                      <Badge variant="destructive" className="absolute -top-1.5 -right-2 h-[18px] min-w-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-rose-500 border-background">
                        {count > 99 ? '99+' : count}
                      </Badge>
                    );
                  })()}
                </div>
                <span className="text-[11px] font-medium leading-none">Alerts</span>
              </Link>

              {/* Cart / Bag */}
              <MiniCart />
            </div>
            
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
