import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { generateSignature } from '@/utils/signature';

// Config types based on the Unlimit API Documentation
export interface ConfigResponse {
  countries: Country[];
  payments: PaymentMethod[];
  fiatExchangeRates: Record<string, Record<string, number>>;
  crypto: CryptoCurrency[];
}

export interface Country {
  id: string;
  states: string[] | null;
}

export interface PaymentMethod {
  id: string;
  offRampSupported: boolean;
  onRampSupported: boolean;
  availableFiatCurrencies: string[];
  availableCountries: string[];
}

export interface CryptoCurrency {
  id: string;
  offRampSupported: boolean;
  onRampSupported: boolean;
  address: string;
  network: string;
  chain: string;
  paymentLimits: PaymentLimit[];
}

export interface PaymentLimit {
  id: string;
  currency: string;
  min: string;
  max: string;
  minCrypto: string;
  maxCrypto: string;
}

export class ConfigService {
  private apiKey: string;
  private apiBaseUrl: string;
  private cacheDuration: number = 20 * 60 * 1000; // 20 minutes in milliseconds
  
  constructor() {
    this.apiKey = process.env.UNLIMIT_API_KEY || '';
    this.apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || 'https://api-sandbox.gatefi.com';
    
    if (!this.apiKey) {
      console.warn('Warning: UNLIMIT_API_KEY not set. Config service will not work properly.');
    }
  }
  
  /**
   * Fetch configuration data with caching
   */
  async getConfig(): Promise<ConfigResponse> {
    const db = await getDb();
    const configCollection = db.collection(COLLECTIONS.CONFIG);
    
    // Try to get config from database
    const cachedConfig = await configCollection.findOne({ 
      type: 'allConfigs',
      expiresAt: { $gt: new Date() } 
    });
    
    // If we have a valid cached config, return it
    if (cachedConfig?.data) {
      return cachedConfig.data as ConfigResponse;
    }
    
    // Otherwise fetch fresh config from API
    const config = await this.fetchConfigFromApi();
    
    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + this.cacheDuration);
    
    // Store in database
    await configCollection.updateOne(
      { type: 'allConfigs' },
      {
        $set: {
          data: config,
          updatedAt: new Date(),
          expiresAt
        }
      },
      { upsert: true }
    );
    
    return config;
  }
  
  /**
   * Fetch configuration from the API
   */
  private async fetchConfigFromApi(): Promise<ConfigResponse> {
    const path = '/v1/external/allConfigs';
    
    try {
      // Generate signature
      const signature = generateSignature('GET', path);
      
      // Make API request
      const response = await fetch(`${this.apiBaseUrl}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
          'signature': signature,
        },
      });
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Config API error:', errorData);
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching config:', error);
      throw error;
    }
  }
  
  /**
   * Get supported payment methods for a specific country
   */
  async getPaymentMethodsForCountry(countryCode: string): Promise<PaymentMethod[]> {
    const config = await this.getConfig();
    return config.payments.filter(payment => 
      payment.availableCountries.includes(countryCode)
    );
  }
  
  /**
   * Get supported cryptocurrencies
   */
  async getSupportedCryptocurrencies(): Promise<CryptoCurrency[]> {
    const config = await this.getConfig();
    return config.crypto;
  }
  
  /**
   * Get supported countries
   */
  async getSupportedCountries(): Promise<Country[]> {
    const config = await this.getConfig();
    return config.countries;
  }
  
  /**
   * Force refresh of config data
   */
  async refreshConfig(): Promise<ConfigResponse> {
    const config = await this.fetchConfigFromApi();
    const db = await getDb();
    
    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + this.cacheDuration);
    
    // Store in database
    await db.collection(COLLECTIONS.CONFIG).updateOne(
      { type: 'allConfigs' },
      {
        $set: {
          data: config,
          updatedAt: new Date(),
          expiresAt
        }
      },
      { upsert: true }
    );
    
    return config;
  }
}

// Export singleton instance
export const configService = new ConfigService();

// Export for testing or custom instances
export default ConfigService;