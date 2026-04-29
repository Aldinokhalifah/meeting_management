import { NextResponse } from 'next/server'

// Route yang tidak butuh auth
const publicRoutes = ['/Login', '/Register'];

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    const isPublicRoute = publicRoutes.includes(pathname);

    // Kalau belum login dan bukan public route → redirect ke login
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/Login', request.url));
    }

    // Kalau sudah login dan buka halaman auth → redirect ke dashboard
    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};