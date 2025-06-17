import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/user';
import { createToken, setAuthCookie } from '@/utils/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;
    
    // Validate inputs
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }
    
    // Verify OTP
    const user = await UserModel.verifyOTP(email, otp);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }
    
    // Create auth token
    const token = await createToken({
      email: user.email,
      isVerified: user.isVerified
    });
    
    // Set auth cookie
    const response = NextResponse.json({ success: true });
    setAuthCookie(response, token);
    
    return response;
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}