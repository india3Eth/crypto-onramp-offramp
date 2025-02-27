import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/services/config-service';

export async function GET(request: NextRequest) {
  try {
    const config = await configService.getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Config error:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}