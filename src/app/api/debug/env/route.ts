import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only enable in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoints only available in development mode' },
      { status: 403 }
    );
  }

  // Check for presence of environment variables
  const envStatus = {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? "Set (redacted)" : "Not set",
    SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || "Not set",
    MONGODB_URI: process.env.MONGODB_URI ? "Set (redacted)" : "Not set",
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "Not set",
    JWT_SECRET: process.env.JWT_SECRET ? "Set (redacted)" : "Not set",
    UNLIMIT_API_KEY: process.env.UNLIMIT_API_KEY ? "Set (redacted)" : "Not set",
    UNLIMIT_API_SECRET_KEY: process.env.UNLIMIT_API_SECRET_KEY ? "Set (redacted)" : "Not set",
    UNLIMIT_API_BASE_URL: process.env.UNLIMIT_API_BASE_URL || "Not set",
    NODE_ENV: process.env.NODE_ENV || "Not set",
  };

  return NextResponse.json(envStatus);
}