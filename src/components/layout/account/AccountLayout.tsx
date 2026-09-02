"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, MapPin, Settings } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks";
import { Avatar } from "@/components/ui/avatar";
import { LoadingState } from "@/components/shared/LoadingState";

const NAV_ITEMS = [
  { href: "/profile", label: "Dashboard", icon: User },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/addresses", label: "Addresses", icon: MapPin },
  { href: "/profile/settings", label: "Settings", icon: Settings },
];

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] mx-auto px-4 py-12 md:py-20 max-w-[1400px] min-h-[60vh] flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (!user) return null; // Let proxy handle redirect

  return (
    <div className="mx-auto w-full max-w-[1400px] mx-auto px-4 py-12 md:py-20 max-w-[1400px] min-h-[70vh]">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0">
          <div className="flex items-center gap-4 mb-10 pb-10 border-b border-border/40">
            <Avatar image={user.image} name={user.name} size="lg" className="rounded-none border border-border/50 h-16 w-16" />
            <div>
              <h2 className="font-bold text-lg leading-tight">{user.name}</h2>
              <p className="text-sm text-muted-foreground mt-1 truncate max-w-[150px]">{user.email}</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                    isActive 
                      ? "bg-foreground text-background" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Nav (Horizontal Scroll) */}
          <nav className="lg:hidden flex overflow-x-auto pb-4 gap-2 no-scrollbar -mx-4 px-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors border ${
                    isActive 
                      ? "border-foreground bg-foreground text-background" 
                      : "border-border/50 text-muted-foreground hover:bg-muted/20"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
