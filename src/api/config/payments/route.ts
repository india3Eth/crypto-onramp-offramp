import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/services/config-service';

export async function GET(request: NextRequest) {
  try {
    // Get country from query params
    const country = request.nextUrl.searchParams.get('country');
    
    if (!country) {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      );
    }
    
    const paymentMethods = await configService.getPaymentMethodsForCountry(country);
    
    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Payment methods error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment methods' },
      { status: 500 }
    );
  }
}
