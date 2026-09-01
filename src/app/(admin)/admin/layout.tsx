"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Tags, 
  LogOut, 
  ArrowLeft,
  Boxes,
  Ticket,
  Star,
  BarChart,
  Menu
} from "lucide-react";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { Avatar } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login?redirect=/admin/dashboard");
      } else if (user.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {ADMIN_NAV.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="-ml-2 h-10 w-10" />}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0 flex flex-col border-r-0">
              <SheetHeader className="p-6 border-b border-border/50 text-left">
                <SheetTitle className="font-bold text-2xl tracking-tighter">
                  Cartify<span className="text-primary">Admin</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="p-6 flex items-center gap-3 border-b border-border/50">
                 <Avatar image={user.image} name={user.name} />
                 <div>
                   <div className="font-medium text-sm leading-tight">{user.name}</div>
                   <div className="text-xs text-muted-foreground">Administrator</div>
                 </div>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <NavLinks onClick={() => setIsMobileOpen(false)} />
              </nav>

              <div className="p-4 border-t border-border/50 space-y-1 bg-muted/10">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Storefront
                </Link>
                <button
                  onClick={() => {
                    logout.mutate();
                    router.push("/");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/admin/dashboard" className="font-bold text-xl tracking-tighter">
            Cartify<span className="text-primary">Admin</span>
          </Link>
        </div>
        <Avatar image={user.image} name={user.name} size="sm" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-background border-r border-border/50 shrink-0 flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border/50">
          <Link href="/admin/dashboard" className="font-bold text-2xl tracking-tighter block">
            Cartify<span className="text-primary">Admin</span>
          </Link>
        </div>

        <div className="p-6 flex items-center gap-3 border-b border-border/50">
           <Avatar image={user.image} name={user.name} />
           <div>
             <div className="font-medium text-sm leading-tight truncate">{user.name}</div>
             <div className="text-xs text-muted-foreground">Administrator</div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-border/50 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Storefront
          </Link>
          <button
            onClick={() => {
              logout.mutate();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
