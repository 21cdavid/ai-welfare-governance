import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const isAdminPath = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPath = req.nextUrl.pathname === '/login'
  const token = req.cookies.get('sb-access-token')?.value

  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isLoginPath && token) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login']
}
