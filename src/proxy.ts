import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected and admin routes here to establish the foundation
const protectedRoutes = [
  '/cart', 
  '/checkout', 
  '/profile', 
  '/orders', 
  '/wishlist', 
  '/addresses', 
  '/notifications'
];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve token from cookies
  const token = request.cookies.get('cartify_access_token')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (!token && (isProtectedRoute || isAdminRoute)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // NOTE: This is just a basic UX route protection.
  // Real security and role-based authorization (e.g. for /admin) MUST be enforced by the backend API.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
