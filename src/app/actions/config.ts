"use server"

import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { generateSignature } from '@/utils/signature';


// Define the structure of the config response
interface ConfigResponse {
  countries: any[];
  payments: any[];
  crypto: any[];
  fiatExchangeRates: Record<string, Record<string, number>>;
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
    console.log("Generated signature:", signature);
    
    // API key is required
    const apiKey = process.env.UNLIMIT_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }
    
    const apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com";
    
    console.log("Making API request to:", `${apiBaseUrl}${path}`);
    
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
      console.error("Config API error:", errorData);
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }
    
    // Parse response
    const configData: ConfigResponse = await response.json();
    
    // Store in MongoDB
    const db = await getDb();
    
    // Store countries
    if (configData.countries && configData.countries.length > 0) {
      await db.collection(COLLECTIONS.COUNTRIES).deleteMany({});
      await db.collection(COLLECTIONS.COUNTRIES).insertMany(configData.countries);
      console.log(`Stored ${configData.countries.length} countries`);
    }
    
    // Store payments
    if (configData.payments && configData.payments.length > 0) {
      await db.collection(COLLECTIONS.PAYMENTS).deleteMany({});
      await db.collection(COLLECTIONS.PAYMENTS).insertMany(configData.payments);
      console.log(`Stored ${configData.payments.length} payment methods`);
    }
    
    // Store crypto
    if (configData.crypto && configData.crypto.length > 0) {
      await db.collection(COLLECTIONS.CRYPTO).deleteMany({});
      await db.collection(COLLECTIONS.CRYPTO).insertMany(configData.crypto);
      console.log(`Stored ${configData.crypto.length} cryptocurrencies`);
    }
    
    return { 
      success: true, 
      message: `Config data stored successfully. Countries: ${configData.countries.length}, Payments: ${configData.payments.length}, Crypto: ${configData.crypto.length}` 
    };
  } catch (error) {
    console.error("Error fetching and storing config:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}