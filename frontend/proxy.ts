import { NextResponse, type NextRequest } from 'next/server';
import { ROLES, ROLE_REDIRECTS } from './lib/constants';

export function proxy(request: NextRequest) {
    const url = request.nextUrl.clone();
    const path = url.pathname;

    // 1. Define route rules
    const isAuthRoute = path.startsWith('/login') || path.startsWith('/forgot-password');
    const isProtectedRoute = path.startsWith('/admin') || path.startsWith('/teacher') || path.startsWith('/student');

    // 2. AUTHENTICATION: Read actual tokens/role from cookies
    const accessToken = request.cookies.get('access_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    // 3. Handle Unauthenticated Users
    if (!accessToken && isProtectedRoute) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // 4. Handle Authenticated Users
    if (accessToken && userRole) {
        if (isAuthRoute) {
            url.pathname = ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || '/login';
            return NextResponse.redirect(url);
        }

        if (path.startsWith('/admin') && userRole !== ROLES.ADMIN) {
            url.pathname = ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || '/login';
            return NextResponse.redirect(url);
        }

        if (path.startsWith('/teacher') && userRole !== ROLES.TEACHER) {
            url.pathname = ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || '/login';
            return NextResponse.redirect(url);
        }

        if (path.startsWith('/student') && userRole !== ROLES.STUDENT) {
            url.pathname = ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || '/login';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
