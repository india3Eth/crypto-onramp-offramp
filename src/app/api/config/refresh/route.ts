import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/services/config-service';
import { getCurrentUser } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Only authenticated users can force refresh
    const user = await getCurrentUser();
    
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Force refresh config
    const config = await configService.refreshConfig();
    
    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Config refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh configuration' },
      { status: 500 }
    );
  }
}