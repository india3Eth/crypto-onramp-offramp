import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/services/quote-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quoteId = params.id;
    
    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }
    
    const quote = await quoteService.getQuoteById(quoteId);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(quote);
  } catch (error) {
    console.error('Get quote error:', error);
    return NextResponse.json(
      { error: 'Failed to get quote' },
      { status: 500 }
    );
  }
}