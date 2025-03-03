import { NextRequest, NextResponse } from 'next/server';
import { CryptoService } from '@/services/crypto-service';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;
    const currency = searchParams.get('currency') || undefined;
    
    // Get onramp supported cryptos
    const cryptos = await CryptoService.getOnrampCryptos(paymentMethod, currency);
    
    // Return simplified crypto list for the frontend
    const simplifiedCryptos = cryptos.map(crypto => ({
      id: crypto.id,
      network: crypto.network,
      chain: crypto.chain,
      paymentMethods: [...new Set(crypto.paymentLimits.map(limit => limit.id))], // Unique payment methods
      supportedFiatCurrencies: [...new Set(crypto.paymentLimits.map(limit => limit.currency))], // Unique currencies
      limits: crypto.paymentLimits.map(limit => ({
        paymentMethod: limit.id,
        currency: limit.currency,
        min: limit.min,
        max: limit.max,
        minCrypto: limit.minCrypto,
        maxCrypto: limit.maxCrypto
      }))
    }));
    
    return NextResponse.json({
      success: true,
      count: simplifiedCryptos.length,
      cryptos: simplifiedCryptos
    });
  } catch (error) {
    console.error('Error fetching onramp cryptos:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}