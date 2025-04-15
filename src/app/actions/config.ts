"use server"

import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { generateSignature } from '@/utils/signature';
import { logger } from '@/services/logger-service';

// Define the structure of the config response
interface ConfigResponse {
  countries: any[];
  payments: any[];
  crypto: any[];
  fiatExchangeRates: Record<string, Record<string, number>>;
}

/**
 * Fetch configurations from the external API and store in MongoDB
 * Enhanced to add onramp and offramp arrays to payment methods
 */
export async function fetchAndStoreConfigs(): Promise<{ success: boolean; message: string }> {
  try {
    // Generate signature
    const method = "GET";
    const path = "/v1/external/allConfigs";
    const signature = generateSignature(method, path);
    logger.info("Generated signature for config fetch:", { signature });
    
    // API key is required
    const apiKey = process.env.UNLIMIT_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }
    
    const apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com";
    logger.info("Making API request to:", { url: `${apiBaseUrl}${path}` });
    
    // Make API request
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "signature": signature,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error("Config API error:", errorData);
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }
    
    // Parse response
    const configData: ConfigResponse = await response.json();
    
    // Process payment method currencies from crypto assets
    const paymentMethodCurrencies = extractPaymentMethodCurrencies(configData.crypto);
    
    // Enhance payment methods with onramp/offramp arrays
    const enhancedPayments = enhancePaymentMethods(configData.payments, paymentMethodCurrencies);
    
    // Replace the payments with enhanced ones
    configData.payments = enhancedPayments;
    
    // Store in MongoDB
    const db = await getDb();
    
    // Store countries
    if (configData.countries && configData.countries.length > 0) {
      await db.collection(COLLECTIONS.COUNTRIES).deleteMany({});
      await db.collection(COLLECTIONS.COUNTRIES).insertMany(configData.countries);
      logger.info(`Stored ${configData.countries.length} countries`);
    }
    
    // Store enhanced payments
    if (configData.payments && configData.payments.length > 0) {
      await db.collection(COLLECTIONS.PAYMENTS).deleteMany({});
      await db.collection(COLLECTIONS.PAYMENTS).insertMany(configData.payments);
      logger.info(`Stored ${configData.payments.length} payment methods with onramp/offramp arrays`);
    }
    
    // Store crypto
    if (configData.crypto && configData.crypto.length > 0) {
      await db.collection(COLLECTIONS.CRYPTO).deleteMany({});
      await db.collection(COLLECTIONS.CRYPTO).insertMany(configData.crypto);
      logger.info(`Stored ${configData.crypto.length} cryptocurrencies`);
    }
    
    return { 
      success: true, 
      message: `Config data stored successfully. Countries: ${configData.countries.length}, Payments: ${configData.payments.length} (with onramp/offramp arrays), Crypto: ${configData.crypto.length}` 
    };
  } catch (error) {
    logger.error("Error fetching and storing config:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}

/**
 * Extract supported fiat currencies for each payment method from crypto assets
 */
function extractPaymentMethodCurrencies(cryptoAssets: any[]): Record<string, { onramp: string[], offramp: string[] }> {
  const paymentMethodCurrencies: Record<string, { onramp: Set<string>, offramp: Set<string> }> = {};
  
  // Process all crypto assets
  cryptoAssets.forEach(crypto => {
    // Skip if no payment limits
    if (!crypto.paymentLimits || !Array.isArray(crypto.paymentLimits)) {
      return;
    }
    
    // Process each payment limit entry
    crypto.paymentLimits.forEach((limit: { id: string; currency: string; methodType: string; }) => {
      const methodId = limit.id;
      const currency = limit.currency;
      const methodType = limit.methodType;
      
      // Initialize entry if it doesn't exist
      if (!paymentMethodCurrencies[methodId]) {
        paymentMethodCurrencies[methodId] = {
          onramp: new Set(),
          offramp: new Set()
        };
      }
      
      // Add currency to appropriate array based on method type
      if (methodType === "onramp") {
        paymentMethodCurrencies[methodId].onramp.add(currency);
      } else if (methodType === "offramp") {
        paymentMethodCurrencies[methodId].offramp.add(currency);
      }
    });
  });
  
  // Convert Sets to arrays for final result
  const result: Record<string, { onramp: string[], offramp: string[] }> = {};
  
  Object.keys(paymentMethodCurrencies).forEach(methodId => {
    result[methodId] = {
      onramp: Array.from(paymentMethodCurrencies[methodId].onramp),
      offramp: Array.from(paymentMethodCurrencies[methodId].offramp)
    };
  });
  
  return result;
}

/**
 * Enhance payment methods with onramp/offramp arrays
 */
function enhancePaymentMethods(
  payments: any[], 
  paymentMethodCurrencies: Record<string, { onramp: string[], offramp: string[] }>
): any[] {
  return payments.map(payment => {
    const methodData = paymentMethodCurrencies[payment.id];
    
    // If we have data for this payment method, add it to the payment object
    if (methodData) {
      return {
        ...payment,
        onramp: methodData.onramp,
        offramp: methodData.offramp
      };
    }
    
    // Otherwise, initialize with empty arrays
    return {
      ...payment,
      onramp: [],
      offramp: []
    };
  });
}