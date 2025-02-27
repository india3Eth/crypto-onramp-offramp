import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/services/config-service';

export async function GET() {
  try {
    const countries = await configService.getSupportedCountries();
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Countries error:', error);
    return NextResponse.json(
      { error: 'Failed to get countries' },
      { status: 500 }
    );
  }
}
