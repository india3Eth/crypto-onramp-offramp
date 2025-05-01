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
  const paymentMethodsMap = new Map<string, PaymentMethod>();
  
  for (const payment of payments) {
    const originalId = payment.id;
    const baseId = payment.id.split('_')[0];
    
    logger.debug(`Mapping payment method: ${originalId} -> ${baseId}`);
    
    if (paymentMethodsMap.has(baseId)) {
      // If we already have an entry for this base ID, merge the data
      const existingPayment = paymentMethodsMap.get(baseId)!;
      
      // Merge currencies and countries (remove duplicates)
      const mergedCurrencies = [...new Set([
        ...existingPayment.availableFiatCurrencies,
        ...payment.availableFiatCurrencies
      ])];
      
      const mergedCountries = [...new Set([
        ...existingPayment.availableCountries,
        ...payment.availableCountries
      ])];
      
      // Merge onramp and offramp currencies
      const mergedOnramp = payment.onramp || existingPayment.onramp || [];
      const onrampCurrencies = existingPayment.onramp || [];
      const mergedOnrampSet = new Set([...onrampCurrencies, ...mergedOnramp]);
      
      const mergedOfframp = payment.offramp || existingPayment.offramp || [];
      const offrampCurrencies = existingPayment.offramp || [];
      const mergedOfframpSet = new Set([...offrampCurrencies, ...mergedOfframp]);
      
      // Update the entry
      paymentMethodsMap.set(baseId, {
        ...existingPayment,
        availableFiatCurrencies: mergedCurrencies,
        availableCountries: mergedCountries,
        onRampSupported: existingPayment.onRampSupported || payment.onRampSupported,
        offRampSupported: existingPayment.offRampSupported || payment.offRampSupported,
        onramp: [...mergedOnrampSet],
        offramp: [...mergedOfframpSet],
        originalIds: [...(existingPayment.originalIds || [existingPayment.id]), payment.id]
      });
      
      logger.debug(`Merged payment method: ${originalId} into ${baseId}`);
    } else {
      // Add new payment method
      paymentMethodsMap.set(baseId, {
        ...payment,
        id: baseId,
        originalIds: [payment.id]
      });
      
      logger.debug(`Added new payment method: ${originalId} as ${baseId}`);
    }
  }
  
  return Array.from(paymentMethodsMap.values());
}

/**
 * Extract supported fiat currencies for each payment method from crypto assets
 */
function extractPaymentMethodCurrencies(cryptoAssets: any[]): Record<string, { onramp: string[], offramp: string[] }> {
  const result: Record<string, { onramp: string[], offramp: string[] }> = {};
  const tempData: Record<string, { onramp: Set<string>, offramp: Set<string> }> = {};
  
  // Process all crypto assets
  cryptoAssets.forEach(crypto => {
    if (!crypto.paymentLimits || !Array.isArray(crypto.paymentLimits)) return;
    
    // Process each payment limit entry
    crypto.paymentLimits.forEach((limit: { id: string; currency: string; methodType: string; }) => {
      const baseId = limit.id.split('_')[0];
      
      // Initialize entry if it doesn't exist
      if (!tempData[baseId]) {
        tempData[baseId] = { onramp: new Set(), offramp: new Set() };
      }
      
      // Add currency to appropriate set
      if (limit.methodType === "onramp") {
        tempData[baseId].onramp.add(limit.currency);
      } else if (limit.methodType === "offramp") {
        tempData[baseId].offramp.add(limit.currency);
      }
    });
  });
  
  // Convert Sets to arrays for final result
  Object.keys(tempData).forEach(methodId => {
    result[methodId] = {
      onramp: Array.from(tempData[methodId].onramp),
      offramp: Array.from(tempData[methodId].offramp)
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
    
    return {
      ...payment,
      onramp: methodData ? methodData.onramp : [],
      offramp: methodData ? methodData.offramp : [],
    };
  });
}

/**
 * Store exchange rates in MongoDB
 */
async function storeExchangeRates(rates: Record<string, Record<string, number>>): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.SETTINGS);
    
    // Store as a separate document with a type identifier
    await collection.updateOne(
      { type: 'fiatExchangeRates' },
      { 
        $set: { 
          rates: rates.EUR || {}, // EUR rates are what we need for comparison
          updatedAt: new Date() 
        },
        $setOnInsert: { 
          type: 'fiatExchangeRates',
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );
    
    logger.info(`Stored exchange rates in database`);
  } catch (error) {
    logger.error("Error storing exchange rates:", error);
    throw error;
  }
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
    
    // Process and store data
    const mergedPayments = mergePaymentMethods(configData.payments);
    const paymentMethodCurrencies = extractPaymentMethodCurrencies(configData.crypto);
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
      logger.info(`Stored ${enhancedPayments.length} merged payment methods`);
    }
    
    // Store crypto
    if (configData.crypto && configData.crypto.length > 0) {
      await db.collection(COLLECTIONS.CRYPTO).deleteMany({});
      await db.collection(COLLECTIONS.CRYPTO).insertMany(configData.crypto);
      logger.info(`Stored ${configData.crypto.length} cryptocurrencies`);
    }
    
    // Store exchange rates if available
    if (configData.fiatExchangeRates) {
      await storeExchangeRates(configData.fiatExchangeRates);
      logger.info("Stored fiat exchange rates");
    } else {
      logger.warn("No fiat exchange rates found in config response");
    }
    
    return { 
      success: true, 
      message: `Config data stored successfully. Countries: ${configData.countries.length}, Payments: ${enhancedPayments.length} (merged from ${configData.payments.length}), Crypto: ${configData.crypto.length}, Exchange Rates: ${configData.fiatExchangeRates ? 'Updated' : 'Not available'}` 
    };
  } catch (error) {
    logger.error("Error fetching and storing config:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}