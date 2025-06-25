// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // Import NextRequest for type annotation
import { getCookie } from 'cookies-next'; // For accessing cookies

// Define public paths that don't require authentication
const publicPaths: string[] = ['/', '/login', '/register']; // Added type annotation

export function middleware(request: NextRequest) { // Added type annotation for request
    const { pathname } = request.nextUrl;
    // getCookie's second argument 'res' is required for server-side usage in cookies-next 12.x+
    // For middleware, you typically pass a dummy or actual response object.
    // However, the current signature of getCookie in cookies-next for middleware context
    // expects { req: NextRequest, res: NextResponse }
    // Let's ensure the getCookie call is correctly typed for middleware context.
    const jwtToken = getCookie('jwtToken', { req: request, res: NextResponse.next() }); // Access cookie in middleware with res

    // If the user is trying to access login/register while authenticated, redirect to '/'
    if (jwtToken && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If the path is a public path, allow access regardless of authentication
    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    // If the path is a protected path and no JWT token is found, redirect to login
    if (!jwtToken) {
        // You can add a query parameter to redirect back after login
        return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }

    // If authenticated and accessing a protected path, allow
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    // Specify which paths the middleware should apply to.
    // This regex matches all paths except _next, api, and static files.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};