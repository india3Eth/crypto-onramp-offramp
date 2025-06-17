"use server"

import { generateSignature } from '@/utils/crypto/signature';
import { UserModel } from '@/models/user';
import { getCurrentUser } from '@/utils/auth/auth';
import { logger } from '@/services/logger-service';

interface CreateCustomerResponse {
  customerId: string;
  createdAt: string;
}

/**
 * Server action to create a customer profile using the external API
 * This connects the user account with the exchange service
 */
export async function createCustomer(phoneNumber: string): Promise<{ success: boolean; message: string; customerId?: string }> {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      throw new Error("User not authenticated");
    }
    
    // Generate signature for API call
    const method = "POST";
    const path = "/v1/external/customers";
    const signature = generateSignature(method, path);
    
    // API key is required
    const apiKey = process.env.UNLIMIT_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }
    
    const apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com";
    
    logger.info(`Creating customer for user: ${currentUser.email}`, { phoneNumber });
    
    // Make API request
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "signature": signature,
      },
      body: JSON.stringify({
        email: currentUser.email,
        phoneNumber: phoneNumber,
        type: "INDIVIDUAL"
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error("Failed to create customer", errorData);
      throw new Error(`Failed to create customer: ${response.statusText}`);
    }
    
    // Parse response
    const data = await response.json() as CreateCustomerResponse;
    
    // Save customerId to the user record
    await UserModel.updateCustomerId(currentUser.email, data.customerId);
    
    logger.info(`Customer created successfully for user: ${currentUser.email}`, { customerId: data.customerId });
    
    return { 
      success: true, 
      message: "Customer created successfully", 
      customerId: data.customerId 
    };
  } catch (error) {
    logger.error("Error creating customer:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}