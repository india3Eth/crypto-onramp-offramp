"use server"

import { generateSignature } from '@/utils/signature';
import { UserModel } from '@/models/user';
import { getCurrentUser } from '@/utils/auth';
import { logger } from '@/services/logger-service';
import type { KYCSubmission } from '@/types/exchange';

interface KYCResponse {
  submissionId: string;
  createdAt: string;
}

/**
 * Server action to submit KYC Level 1 information
 */
export async function submitKycLevel1(data: KYCSubmission): Promise<{ 
  success: boolean; 
  message: string; 
  submissionId?: string 
}> {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      throw new Error("User not authenticated");
    }
    
    // Verify user has a customerId
    const user = await UserModel.getUserByEmail(currentUser.email);
    
    if (!user || !user.customerId) {
      throw new Error("Customer profile not found. Please create a customer profile first.");
    }
    
    // Generate signature for API call
    const method = "POST";
    const path = `/v1/external/customers/${user.customerId}/kyc`;
    const signature = generateSignature(method, path);
    
    // API key is required
    const apiKey = process.env.UNLIMIT_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }
    
    const apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com";
    
    logger.info(`Submitting KYC Level 1 for customer: ${user.customerId}`, { 
      email: currentUser.email,
      firstName: data.firstName,
      lastName: data.lastName,
      countryOfResidence: data.countryOfResidence,
      nationality: data.nationality
    });
    
    // Make API request
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "signature": signature,
      },
      body: JSON.stringify({
        kycSubmission: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          countryOfResidence: data.countryOfResidence,
          nationality: data.nationality
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error("Failed to submit KYC", errorData);
      throw new Error(`Failed to submit KYC: ${response.statusText}`);
    }
    
    // Parse response
    const responseData = await response.json() as KYCResponse;
    
    // Update KYC data and status in the user record
    await UserModel.updateKYCData(currentUser.email, {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      countryOfResidence: data.countryOfResidence,
      submissionId: responseData.submissionId
    }, 'PENDING');
    
    logger.info(`KYC Level 1 submitted successfully for customer: ${user.customerId}`, { 
      submissionId: responseData.submissionId
    });
    
    return { 
      success: true, 
      message: "KYC submitted successfully. Your verification is being processed.", 
      submissionId: responseData.submissionId 
    };
  } catch (error) {
    logger.error("Error submitting KYC:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}