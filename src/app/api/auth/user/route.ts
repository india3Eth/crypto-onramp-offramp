import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Get current user from auth cookie
    const user = await getCurrentUser();
    
    // If no user is found, return 401 Unauthorized
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Return user data (excluding sensitive information)
    return NextResponse.json({
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
      // Add other non-sensitive user fields as needed
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}