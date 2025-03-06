import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/user';

// Secret key for JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'crypto-exchange-secret-key-please-change-in-production'
);

export interface AuthUser {
  email: string;
  isVerified: boolean;
  role?: string;
  [key: string]: any; // Add index signature to satisfy JWTPayload requirement
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create JWT token
 */
export async function createToken(payload: AuthUser): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // 1 day expiry
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AuthUser;
  } catch (error) {
    return null;
  }
}

/**
 * Get current user from cookies
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

/**
 * Set auth token cookie
 */
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: 'auth-token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
  
  return response;
}

/**
 * Clear auth token cookie
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}

/**
 * Middleware to protect routes
 */
export async function authMiddleware(
  request: NextRequest
): Promise<NextResponse | undefined> {
  const user = await getCurrentUser();
  
  // If no user or not verified, redirect to login
  if (!user || !user.isVerified) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  
  // User is authenticated, proceed
  return undefined;
}