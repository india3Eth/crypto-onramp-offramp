"use server"

import { getCurrentUser } from '@/utils/auth';
import { UserModel } from '@/models/user';
import { logger } from '@/services/logger-service';
import { orderService } from '@/services/order-service';
import type { OnrampOrderRequest, OfframpOrderRequest } from '@/services/order-service';
import { generateRandomDeviceId } from '@/utils/device-id';

interface CreateOrderResult {
  success: boolean;
  message: string;
  checkoutUrl?: string;
  transactionId?: string;
}

/**
 * Generate a server-side device ID
 * This is a simple implementation that should be consistent enough for the server
 */
function generateServerDeviceId(): string {
  // Generate a random ID that's unique for this server instance
  return `server-${generateRandomDeviceId()}`;
}

/**
 * Server action to create an onramp (buy crypto) order
 */
export async function createOnrampOrder(
  quoteData: any,
  depositAddress: string
): Promise<CreateOrderResult> {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      return {
        success: false,
        message: "User not authenticated"
      };
    }
    
    // Get full user data including customerId
    const user = await UserModel.getUserByEmail(currentUser.email);
    
    if (!user || !user.customerId) {
      return {
        success: false,
        message: "Customer profile not found. Please create a customer profile first."
      };
    }
    
    // Validate KYC status
    if (user.kycStatus !== 'COMPLETED') {
      return {
        success: false,
        message: "KYC verification must be completed before creating orders."
      };
    }
    
    // Get base URL for redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const successUrl = `${baseUrl}/order/success`;
    const cancelUrl = `${baseUrl}/order/cancel`;
    
    // Create onramp order request
    const orderRequest: OnrampOrderRequest = {
      quoteId: quoteData.quoteId,
      fromCurrency: quoteData.fromCurrency,
      toCurrency: quoteData.toCurrency,
      amount: quoteData.fromAmount,
      paymentMethodType: quoteData.paymentMethodType,
      depositAddress: depositAddress,
      customerId: user.customerId,
      successUrl,
      cancelUrl,
      chain: quoteData.chain || ""
    };
    
    logger.info(`Creating onramp order for customer: ${user.customerId}`, { 
      email: currentUser.email,
      quoteId: quoteData.quoteId,
      fromCurrency: quoteData.fromCurrency,
      toCurrency: quoteData.toCurrency
    });
    
    // Generate a server-side device ID
    const deviceId = generateServerDeviceId();
    
    // Call the order service to create the order with the server-generated device ID
    const orderResponse = await orderService.createOnrampOrder(orderRequest, deviceId);
    
    logger.info(`Onramp order created successfully`, {
      transactionId: orderResponse.transaction.transactionId,
      checkoutUrl: orderResponse.checkoutUrl
    });
    
    // Return success with checkout URL
    return { 
      success: true, 
      message: "Order created successfully", 
      checkoutUrl: orderResponse.checkoutUrl,
      transactionId: orderResponse.transaction.transactionId
    };
  } catch (error) {
    logger.error("Error creating onramp order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}

/**
 * Server action to create an offramp (sell crypto) order
 */
export async function createOfframpOrder(
  quoteData: any,
  depositAddress: string
): Promise<CreateOrderResult> {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      return {
        success: false,
        message: "User not authenticated"
      };
    }
    
    // Get full user data including customerId
    const user = await UserModel.getUserByEmail(currentUser.email);
    
    if (!user || !user.customerId) {
      return {
        success: false,
        message: "Customer profile not found. Please create a customer profile first."
      };
    }
    
    // Validate KYC status
    if (user.kycStatus !== 'COMPLETED') {
      return {
        success: false,
        message: "KYC verification must be completed before creating orders."
      };
    }
    
    // Get base URL for redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/order/success`;
    const cancelUrl = `${baseUrl}/order/cancel`;
    
    // Create offramp order request
    const orderRequest: OfframpOrderRequest = {
      quoteId: quoteData.quoteId,
      fromCurrency: quoteData.fromCurrency,
      toCurrency: quoteData.toCurrency,
      amount: quoteData.fromAmount,
      paymentMethodType: quoteData.paymentMethodType,
      depositAddress: depositAddress, // User's crypto address for sending funds
      customerId: user.customerId,
      successUrl,
      cancelUrl,
      chain: quoteData.chain || ""
    };
    
    logger.info(`Creating offramp order for customer: ${user.customerId}`, { 
      email: currentUser.email,
      quoteId: quoteData.quoteId,
      fromCurrency: quoteData.fromCurrency,
      toCurrency: quoteData.toCurrency
    });
    
    // Generate a server-side device ID
    const deviceId = generateServerDeviceId();
    
    // Call the order service to create the order with the server-generated device ID
    const orderResponse = await orderService.createOfframpOrder(orderRequest, deviceId);
    
    logger.info(`Offramp order created successfully`, {
      transactionId: orderResponse.transaction.transactionId
    });
    
    // Return success with checkout URL if available
    return { 
      success: true, 
      message: "Order created successfully", 
      transactionId: orderResponse.transaction.transactionId
    };
  } catch (error) {
    logger.error("Error creating offramp order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}