import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/services/quote-service';
import { getCurrentUser } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { fromAmount, fromCurrency, toCurrency, paymentMethodType, chain } = body;
    
    // Validate required fields
    if (!fromAmount || !fromCurrency || !toCurrency || !paymentMethodType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create quote
    const quote = await quoteService.createOfframpQuote({
      fromAmount,
      fromCurrency,
      toCurrency,
      paymentMethodType,
      chain
    });
    
    return NextResponse.json(quote);
  } catch (error) {
    console.error('Offramp quote error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

