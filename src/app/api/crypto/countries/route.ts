import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/mongodb';

// Country interface
interface Country {
  id: string;
  states: any[] | null;
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;
    const operation = searchParams.get('operation') as 'onramp' | 'offramp' | undefined;
    
    // Get database connection
    const db = await getDb();
    
    // First, get all countries
    const countries = await db.collection(COLLECTIONS.COUNTRIES)
        .find({})
        .toArray() as unknown as Country[];
    
    // If payment method filter is specified, we need to check which countries
    // are supported by that payment method
    if (paymentMethod) {
      // Get the payment method data
      const paymentMethodData = await db.collection(COLLECTIONS.PAYMENTS)
        .findOne({ id: paymentMethod });
      
      if (!paymentMethodData) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Payment method ${paymentMethod} not found` 
          },
          { status: 404 }
        );
      }
      
      // Check operation type if specified
      if (operation === 'onramp' && !paymentMethodData.onRampSupported) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Payment method ${paymentMethod} does not support onramp` 
          },
          { status: 400 }
        );
      }
      
      if (operation === 'offramp' && !paymentMethodData.offRampSupported) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Payment method ${paymentMethod} does not support offramp` 
          },
          { status: 400 }
        );
      }
      
      // Filter countries to those supported by the payment method
      const supportedCountryIds = paymentMethodData.availableCountries || [];
      const filteredCountries = countries.filter(country => 
        supportedCountryIds.includes(country.id)
      );
      
      return NextResponse.json({
        success: true,
        count: filteredCountries.length,
        countries: filteredCountries
      });
    }
    
    // If no filters, return all countries
    return NextResponse.json({
      success: true,
      count: countries.length,
      countries: countries
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}