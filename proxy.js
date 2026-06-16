import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register'];
const authApiRoutes = ['/api/auth/login', '/api/auth/register'];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (authApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(decoded.id));
    requestHeaders.set('x-user-email', decoded.email);
    requestHeaders.set('x-user-name', decoded.name);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
