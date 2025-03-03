import { getDb, COLLECTIONS } from '@/lib/mongodb';

// Define types for crypto data
export interface CryptoAsset {
  id: string;
  offRampSupported: boolean;
  onRampSupported: boolean;
  address?: string;
  network?: string;
  chain?: string;
  paymentLimits: PaymentLimit[];
}

export interface PaymentLimit {
  id: string; // Payment method ID
  currency: string;
  min: number;
  max: number;
  minCrypto: number;
  maxCrypto: number;
  methodType: 'onramp' | 'offramp';
}

export class CryptoService {
  /**
   * Get crypto assets that support onramp
   * @param paymentMethod Optional payment method to filter by
   * @param currency Optional fiat currency to filter by
   */
  static async getOnrampCryptos(paymentMethod?: string, currency?: string): Promise<CryptoAsset[]> {
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.CRYPTO);
    
    // Basic query to get onramp supported cryptos
    const query = {
      onRampSupported: true
    };
    
    // Get assets from DB
    const assets = await collection.find(query).toArray() as unknown as CryptoAsset[];
    
    // If payment method or currency filter is specified, filter the payment limits
    if (paymentMethod || currency) {
      return assets.map(asset => {
        // Clone the asset
        const filtered = { ...asset };
        
        // Filter payment limits based on criteria
        filtered.paymentLimits = asset.paymentLimits.filter(limit => {
          // Only include onramp methods
          if (limit.methodType !== 'onramp') return false;
          
          // Filter by payment method if specified
          if (paymentMethod && limit.id !== paymentMethod) return false;
          
          // Filter by currency if specified
          if (currency && limit.currency !== currency) return false;
          
          return true;
        });
        
        return filtered;
      }).filter(asset => asset.paymentLimits.length > 0); // Remove assets with no matching payment limits
    }
    
    return assets;
  }
  
  /**
   * Get crypto assets that support offramp
   * @param paymentMethod Optional payment method to filter by
   * @param currency Optional fiat currency to filter by
   */
  static async getOfframpCryptos(paymentMethod?: string, currency?: string): Promise<CryptoAsset[]> {
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.CRYPTO);
    
    // Basic query to get offramp supported cryptos
    const query = {
      offRampSupported: true
    };
    
    // Get assets from DB
    const assets = await collection.find(query).toArray() as unknown as CryptoAsset[];
    
    // If payment method or currency filter is specified, filter the payment limits
    if (paymentMethod || currency) {
      return assets.map(asset => {
        // Clone the asset
        const filtered = { ...asset };
        
        // Filter payment limits based on criteria
        filtered.paymentLimits = asset.paymentLimits.filter(limit => {
          // Only include offramp methods
          if (limit.methodType !== 'offramp') return false;
          
          // Filter by payment method if specified
          if (paymentMethod && limit.id !== paymentMethod) return false;
          
          // Filter by currency if specified
          if (currency && limit.currency !== currency) return false;
          
          return true;
        });
        
        return filtered;
      }).filter(asset => asset.paymentLimits.length > 0); // Remove assets with no matching payment limits
    }
    
    return assets;
  }
  
  /**
   * Get a specific crypto asset by ID
   */
  static async getCryptoById(id: string): Promise<CryptoAsset | null> {
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.CRYPTO);
    
    return collection.findOne({ id }) as Promise<CryptoAsset | null>;
  }
  
  /**
   * Get available payment methods for crypto operations
   * @param type Filter by onramp or offramp
   */
  static async getPaymentMethods(type: 'onramp' | 'offramp'): Promise<string[]> {
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.PAYMENTS);
    
    const query = type === 'onramp' 
      ? { onRampSupported: true }
      : { offRampSupported: true };
    
    const paymentMethods = await collection.find(query).toArray();
    
    // Return just the IDs
    return paymentMethods.map(method => method.id);
  }
}

// Export singleton instance
export const cryptoService = new CryptoService();

// Export for testing or custom instances
export default CryptoService;