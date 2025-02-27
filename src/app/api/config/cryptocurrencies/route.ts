import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/services/config-service';

export async function GET() {
  try {
    const cryptocurrencies = await configService.getSupportedCryptocurrencies();
    return NextResponse.json(cryptocurrencies);
  } catch (error) {
    console.error('Cryptocurrencies error:', error);
    return NextResponse.json(
      { error: 'Failed to get cryptocurrencies' },
      { status: 500 }
    );
  }
}