import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    console.log('[Middleware] Protecting admin route:', pathname);

    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('[Middleware] Found token in Authorization header');
    } else {
      // Try to get token from cookie
      const cookieToken = request.cookies.get('token');
      console.log('[Middleware] Cookie token:', cookieToken ? 'present' : 'missing');
      console.log('[Middleware] All cookies:', request.cookies.getAll());
      token = cookieToken?.value || null;
    }

    if (!token) {
      console.log('[Middleware] No token found, redirecting to login');
      // No token found, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log('[Middleware] Token found, verifying...');

    // Verify token
    const user = verifyToken(token);

    if (!user) {
      console.log('[Middleware] Token invalid, redirecting to login');
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log('[Middleware] Token valid, user:', user.userId, 'role:', user.role);

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      console.log('[Middleware] User is not admin, redirecting to home');
      // Not an admin, redirect to home with error
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(homeUrl);
    }

    console.log('[Middleware] Access granted to admin route');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
