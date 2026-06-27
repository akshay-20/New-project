import { auth } from './auth'
import { NextResponse } from 'next/server'
import type { NextMiddleware } from 'next/server'

/**
 * Protect authenticated routes.
 * Public: /, /login, /demo, /api/auth/*, /api/review (demo mode)
 * Protected: /dashboard, /review/new, /review/[id] (non-public)
 */
const middleware = auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isPublicPath =
    nextUrl.pathname === '/' ||
    nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/demo') ||
    nextUrl.pathname.startsWith('/api/auth') ||
    nextUrl.pathname.startsWith('/api/inngest')

  if (!isPublicPath && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export default middleware as unknown as NextMiddleware

export const config = {
  // Match all routes except static files, _next, favicon
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}