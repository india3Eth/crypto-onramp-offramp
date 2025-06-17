import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/auth/auth';
import { logger } from '@/services/logger-service';

/**
 * Middleware to protect admin routes
 * Only allows access to users with the admin role
 */
export async function adminMiddleware(request: NextRequest): Promise<NextResponse | undefined> {
  // Get the current user from the auth cookie
  const user = await getCurrentUser();
  
  // If no user or not verified, redirect to login
  if (!user || !user.isVerified) {
    logger.info('Unauthorized access attempt to admin route', {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      isVerified: user?.isVerified,
    });
    
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  
  // If user is not an admin, redirect to unauthorized page
  if (user.role !== 'admin') {
    logger.warn('Non-admin user attempted to access admin route', {
      path: request.nextUrl.pathname,
      userEmail: user.email,
      userRole: user.role,
    });
    
    const url = request.nextUrl.clone();
    url.pathname = '/unauthorized';
    return NextResponse.redirect(url);
  }
  
  // User is authenticated and is an admin, proceed
  logger.debug('Admin access granted', {
    path: request.nextUrl.pathname,
    userEmail: user.email,
  });
  
  return undefined;
}

/**
 * Function to be used in server actions to verify admin access
 * Throws an error if the user is not an admin
 */
export async function requireAdmin(): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user || !user.isVerified ) {
    logger.warn('Non-admin user attempted to call admin server action', {
      hasUser: !!user,
      isVerified: user?.isVerified,
      userRole: user?.role,
    });
    
    throw new Error('Unauthorized: Admin access required');
  }
}