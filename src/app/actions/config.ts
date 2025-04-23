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

// Interface for payment method
interface PaymentMethod {
  id: string;
  offRampSupported: boolean;
  onRampSupported: boolean;
  availableFiatCurrencies: string[];
  availableCountries: string[];
  onramp?: string[];
  offramp?: string[];
  [key: string]: any; // Allow for additional properties
}

/**
 * Merge payment methods with the same base ID (e.g., CARD_EU, CARD_INTL -> CARD)
 */
function mergePaymentMethods(payments: PaymentMethod[]): PaymentMethod[] {
  // Create a map to group payment methods by their base ID
  const paymentMethodsMap = new Map<string, PaymentMethod>();
  
  for (const payment of payments) {
    // Extract the base ID (e.g., "CARD" from "CARD_EU")
    const originalId = payment.id;
    const baseId = payment.id.split('_')[0];
    
    // Log the mapping for debugging
    logger.debug(`Mapping payment method: ${originalId} -> ${baseId}`);
    
    if (paymentMethodsMap.has(baseId)) {
      // If we already have an entry for this base ID, merge the data
      const existingPayment = paymentMethodsMap.get(baseId)!;
      
      // Merge available fiat currencies (remove duplicates)
      const mergedCurrencies = [
        ...new Set([
          ...existingPayment.availableFiatCurrencies,
          ...payment.availableFiatCurrencies
        ])
      ];
      
      // Merge available countries (remove duplicates)
      const mergedCountries = [
        ...new Set([
          ...existingPayment.availableCountries,
          ...payment.availableCountries
        ])
      ];
      
      // Merge onramp currencies (remove duplicates)
      const mergedOnramp = payment.onramp || existingPayment.onramp || [];
      const onrampCurrencies = existingPayment.onramp || [];
      const mergedOnrampSet = new Set([...onrampCurrencies, ...mergedOnramp]);
      
      // Merge offramp currencies (remove duplicates)
      const mergedOfframp = payment.offramp || existingPayment.offramp || [];
      const offrampCurrencies = existingPayment.offramp || [];
      const mergedOfframpSet = new Set([...offrampCurrencies, ...mergedOfframp]);
      
      // Update the entry in our map
      paymentMethodsMap.set(baseId, {
        ...existingPayment,
        availableFiatCurrencies: mergedCurrencies,
        availableCountries: mergedCountries,
        onRampSupported: existingPayment.onRampSupported || payment.onRampSupported,
        offRampSupported: existingPayment.offRampSupported || payment.offRampSupported,
        onramp: [...mergedOnrampSet],
        offramp: [...mergedOfframpSet],
        // Add metadata about original IDs that were merged
        originalIds: [...(existingPayment.originalIds || [existingPayment.id]), payment.id]
      });
      
      logger.debug(`Merged payment method: ${originalId} into ${baseId}`, {
        currenciesCount: mergedCurrencies.length,
        countriesCount: mergedCountries.length
      });
    } else {
      // If this is the first occurrence of this base ID, store it with its original ID
      paymentMethodsMap.set(baseId, {
        ...payment,
        id: baseId, // Update the ID to the base ID
        originalIds: [payment.id] // Track the original ID
      });
      
      logger.debug(`Added new payment method: ${originalId} as ${baseId}`);
    }
  }
  
  // Convert the map back to an array
  return Array.from(paymentMethodsMap.values());
}

/**
 * Fetch configurations from the external API and store in MongoDB
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
    
    // Merge payment methods with the same base ID
    const mergedPayments = mergePaymentMethods(configData.payments);
    logger.info(`Merged ${configData.payments.length} payment methods into ${mergedPayments.length} unique payment methods`);
    
    // Process payment method currencies from crypto assets
    const paymentMethodCurrencies = extractPaymentMethodCurrencies(configData.crypto);
    
    // Enhance payment methods with onramp/offramp arrays
    const enhancedPayments = enhancePaymentMethods(mergedPayments, paymentMethodCurrencies);
    
    // Store in MongoDB
    const db = await getDb();
    
    // Store countries
    if (configData.countries && configData.countries.length > 0) {
      await db.collection(COLLECTIONS.COUNTRIES).deleteMany({});
      await db.collection(COLLECTIONS.COUNTRIES).insertMany(configData.countries);
      logger.info(`Stored ${configData.countries.length} countries`);
    }
    
    // Store enhanced payments
    if (enhancedPayments && enhancedPayments.length > 0) {
      await db.collection(COLLECTIONS.PAYMENTS).deleteMany({});
      await db.collection(COLLECTIONS.PAYMENTS).insertMany(enhancedPayments);
      logger.info(`Stored ${enhancedPayments.length} merged payment methods with onramp/offramp arrays`);
    }
    
    // Store crypto
    if (configData.crypto && configData.crypto.length > 0) {
      await db.collection(COLLECTIONS.CRYPTO).deleteMany({});
      await db.collection(COLLECTIONS.CRYPTO).insertMany(configData.crypto);
      logger.info(`Stored ${configData.crypto.length} cryptocurrencies`);
    }
    
    return { 
      success: true, 
      message: `Config data stored successfully. Countries: ${configData.countries.length}, Payments: ${enhancedPayments.length} (merged from ${configData.payments.length} with onramp/offramp arrays), Crypto: ${configData.crypto.length}` 
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
      
      // Extract the base ID (e.g., "CARD" from "CARD_EU")
      const baseId = methodId.split('_')[0];
      
      // Initialize entry if it doesn't exist for base ID
      if (!paymentMethodCurrencies[baseId]) {
        paymentMethodCurrencies[baseId] = {
          onramp: new Set(),
          offramp: new Set()
        };
      }
      
      // Add currency to appropriate array based on method type
      if (methodType === "onramp") {
        paymentMethodCurrencies[baseId].onramp.add(currency);
      } else if (methodType === "offramp") {
        paymentMethodCurrencies[baseId].offramp.add(currency);
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
  payments: PaymentMethod[], 
  paymentMethodCurrencies: Record<string, { onramp: string[], offramp: string[] }>
): PaymentMethod[] {
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