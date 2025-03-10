import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/auth';
import { UserModel } from '@/models/user';

export async function GET(request: NextRequest) {
  try {
    // Get current user from auth cookie
    const authUser = await getCurrentUser();
    
    // If no user is found, return 401 Unauthorized
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get full user details from database including customerId
    const user = await UserModel.getUserByEmail(authUser.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user data (excluding sensitive information)
    return NextResponse.json({
      email: user.email,
      isVerified: user.isVerified,
      customerId: user.customerId,
      role: user.role,
      kycStatus: user.kycStatus,
      kycData: user.kycData
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}