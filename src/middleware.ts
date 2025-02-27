import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/utils/auth'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/exchange',
  '/kyc',
]

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/about',
  '/support',
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Check if the path is a protected route
  if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
    return await authMiddleware(request)
  }
  
  // For all other routes, proceed normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - API routes (/api/*)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}