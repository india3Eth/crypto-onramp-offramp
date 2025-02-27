import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    console.log("Login API route called");
    const body = await request.json();
    const { email } = body;
    
    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Create or update user and send OTP
    await UserModel.createOrUpdateUser(email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}