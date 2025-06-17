import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/utils/auth/auth';

export async function POST(request: NextRequest) {
  try {
    // Clear auth cookie
    const response = NextResponse.json({ success: true });
    clearAuthCookie(response);
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}