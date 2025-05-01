import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/utils/auth'
import { adminMiddleware } from '@/middleware/admin-middleware'
import { logger } from '@/services/logger-service'

// Generate a unique request ID
function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/kyc',
  '/profile',
  '/kyc-limit-check',
  '/transactions',
  '/wallet-address',
]

// Routes that require admin access
const ADMIN_ROUTES = [
  '/admin',
]

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/about',
  '/support',
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const requestId = generateRequestId()
  
  // Set a unique request ID for logging purposes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)
  
  // Log the request
  logger.debug(`Received request: ${request.method} ${path}`, {
    requestId,
    method: request.method,
    path,
    userAgent: request.headers.get('user-agent') || 'unknown',
  }, { requestId, skipDb: true })
  
  // Check if the path is an admin route
  if (ADMIN_ROUTES.some(route => path.startsWith(route))) {
    const result = await adminMiddleware(request)
    if (result) return result
  }
  // Check if the path is a protected route
  else if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
    const result = await authMiddleware(request)
    if (result) return result
  }
  
  // For all other routes, proceed normally
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (internal Next.js paths)
     * - static files (images, fonts, etc.)
     * - favicon.ico (browser favicon)
     * - public folder files
     * - API routes (/api/*)
     * - Open API routes that don't need auth (/open-api/*)
     */
    '/((?!_next/static|_next/image|_next/font|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api|open-api).*)',
  ],
}