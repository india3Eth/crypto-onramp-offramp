import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/mongodb';

// Interface for payment method data
interface PaymentMethod {
  id: string;
  offRampSupported: boolean;
  onRampSupported: boolean;
  availableFiatCurrencies: string[];
  availableCountries: string[];
  onramp: string[]; 
  offramp: string[]; 
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'onramp' | 'offramp' || 'onramp'; // Default to onramp
    const country = searchParams.get('country') || undefined;
    
    // Get database connection
    const db = await getDb();
    
    // Build query based on type
    const query: any = {};
    if (type === 'onramp') {
      query.onRampSupported = true;
    } else if (type === 'offramp') {
      query.offRampSupported = true;
    }
    
    // Add country filter if provided
    if (country) {
      query.availableCountries = country;
    }
    
    // Fetch payment methods
    const paymentMethods = await db.collection(COLLECTIONS.PAYMENTS)
        .find(query)
        .toArray() as unknown as PaymentMethod[];
    
    // Format the response
    const formattedPaymentMethods = paymentMethods.map(method => ({
      id: method.id,
      onRampSupported: method.onRampSupported,
      offRampSupported: method.offRampSupported,
      availableFiatCurrencies: method.availableFiatCurrencies,
      onramp: method.onramp || [],
      offramp: method.offramp || [],
      // Only include countries if specifically requested to keep response size manageable
      ...(searchParams.has('includeCountries') ? { availableCountries: method.availableCountries } : {})
    }));
    
    return NextResponse.json({
      success: true,
      count: formattedPaymentMethods.length,
      paymentMethods: formattedPaymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}