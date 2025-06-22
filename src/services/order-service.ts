import { apiClient } from '@/lib/api-client';
import type { OnrampTransaction } from '@/types/exchange';
import { getDeviceId } from '@/utils/common/device-id';

// API paths
const API_PATHS = {
  ONRAMP: '/v1/external/onramp',
  OFFRAMP: '/v1/external/offramp',
};

// Order creation interfaces
export interface OnrampOrderRequest {
  quoteId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  paymentMethodType: string;
  depositAddress: string;
  customerId: string;
  successUrl: string;
  cancelUrl: string;
  chain?: string;
}

export interface OfframpOrderRequest {
  quoteId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  paymentMethodType: string;
  depositAddress: string; // User's crypto wallet address
  customerId: string;
  successUrl: string;
  cancelUrl: string;
  chain?: string;
  // Offramp specific fields
  fiatAccountId?: string;
}

// Fiat payment instructions interface
export interface FiatPaymentInstructions {
  beneficiaryName: string;
  expirationDate: string;
  iban: string;
  paymentType: string;
  reference: string;
}

// Order response interfaces
export interface OnrampOrderResponse {
  transaction: OnrampTransaction;
  fiatPaymentInstructions?: FiatPaymentInstructions;
  checkoutUrl?: string;
  expirationDate: string;
}

export interface OfframpOrderResponse {
  transactionId: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  chain: string;
  status: string;
  fiatAccountId: string;
  depositAddress: string;
  memo?: string;
  expiration: string;
  quote: {
    quoteId: string;
    fromCurrency: string;
    toCurrency: string;
    toAmount: string;
    fromAmount: string;
    rate: string;
    fees: Array<{
      type: string;
      amount: string;
      currency: string;
    }>;
    chain: string;
    paymentMethodType: string;
    expiration: string;
    metadata: Record<string, any>;
  };
}

export class OrderService {
  /**
   * Create an onramp (buy) order
   */
  async createOnrampOrder(
    request: OnrampOrderRequest,
    deviceId?: string
  ): Promise<OnrampOrderResponse> {
    try {
      // Get device ID for the request or use provided one
      // If no device ID is provided (which might happen on server), 
      // getDeviceId will generate a random one
      const finalDeviceId = deviceId || await getDeviceId();
      
      // Prepare request body
      const payload = {
        ...request,
        // Use quoteId as idempotency key to prevent duplicate orders
        idempotencyKey: request.quoteId
      };
      
      // Add additional headers for the request
      const headers = {
        'X-Device-Id': finalDeviceId
      };

      console.log('deviceId', finalDeviceId);
      
      // Call the API client with custom headers
      return apiClient.request<OnrampOrderResponse>(
        'POST', 
        API_PATHS.ONRAMP, 
        payload, 
        headers,
        0
      );
    } catch (error) {
      console.error('Error creating onramp order:', error);
      throw error;
    }
  }
  
  /**
   * Create an offramp (sell) order
   */
  async createOfframpOrder(
    request: OfframpOrderRequest,
    deviceId?: string
  ): Promise<OfframpOrderResponse> {
    try {
      // Get device ID for the request or use provided one
      const finalDeviceId = deviceId || await getDeviceId();
      
      // Prepare request body
      const payload = {
        ...request,
        // Use quoteId as idempotency key to prevent duplicate orders
        idempotencyKey: request.quoteId
      };
      
      // Add additional headers for the request
      const headers = {
        'X-Device-Id': finalDeviceId
      };

      
      
      // Call the API client with custom headers
      return apiClient.request<OfframpOrderResponse>(
        'POST', 
        API_PATHS.OFFRAMP, 
        payload, 
        headers
      );
    } catch (error) {
      console.error('Error creating offramp order:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();