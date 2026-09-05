import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'darasalive_session';

export async function middleware(req: NextRequest) {
  // Maintenance mode — set MAINTENANCE_MODE=true in Vercel env vars to
  // take the whole site offline with a proper message, instantly, without
  // a redeploy. Set it back to false (or remove it) to restore access.
  if (
    process.env.MAINTENANCE_MODE === 'true' &&
    !req.nextUrl.pathname.startsWith('/maintenance') &&
    !req.nextUrl.pathname.startsWith('/_next') &&
    !req.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.rewrite(new URL('/maintenance', req.url));
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api).*)']
};
