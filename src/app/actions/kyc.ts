"use server"

import { generateSignature } from '@/utils/signature';
import { UserModel } from '@/models/user';
import { getCurrentUser } from '@/utils/auth';
import { logger } from '@/services/logger-service';
import type { KYCSubmission } from '@/types/exchange';
import { refreshKycStatus } from './kyc-status';

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
  submissionId?: string;
  status?: string;
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
    
    // Make API request to submit KYC data
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
    }, 'IN_REVIEW'); // Set to IN_REVIEW which means data is ready but not yet submitted for review
    
    logger.info(`KYC Level 1 submitted successfully for customer: ${user.customerId}`, { 
      submissionId: responseData.submissionId
    });
    
    // Automatically submit for review
    await submitKycForReview(user.customerId, responseData.submissionId);
    
    // Refresh KYC status to get the latest updates
    const statusResult = await refreshKycStatus();
    
    return { 
      success: true, 
      message: "KYC submitted successfully and sent for review. Your verification is being processed.", 
      submissionId: responseData.submissionId,
      status: statusResult.kycStatus || 'PENDING'
    };
  } catch (error) {
    logger.error("Error submitting KYC:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}

/**
 * Internal helper function to submit KYC data for review
 */
async function submitKycForReview(
  customerId: string,
  submissionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Generate signature for API call
    const method = "POST";
    const path = `/v1/external/customers/${customerId}/kyc/${submissionId}/submit`;
    const signature = generateSignature(method, path);
    
    // API key is required
    const apiKey = process.env.UNLIMIT_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }
    
    const apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com";
    
    logger.info(`Submitting KYC data for review for customer: ${customerId}`, { 
      submissionId: submissionId
    });
    
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
      logger.error("Failed to submit KYC for review", errorData);
      throw new Error(`Failed to submit KYC for review: ${response.statusText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    
    logger.info(`KYC automatically submitted for review successfully for customer: ${customerId}`, { 
      submissionId: submissionId
    });
    
    return { 
      success: true, 
      message: "KYC submitted for review successfully."
    };
  } catch (error) {
    logger.error("Error submitting KYC for review:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}

/**
 * Public server action to submit KYC data for review
 */
export async function submitKycForReviewPublic(): Promise<{ 
  success: boolean; 
  message: string; 
}> {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      throw new Error("User not authenticated");
    }
    
    // Get full user data including customerId and submissionId
    const user = await UserModel.getUserByEmail(currentUser.email);
    
    if (!user || !user.customerId) {
      throw new Error("Customer profile not found. Please create a customer profile first.");
    }
    
    if (!user.kycData?.submissionId) {
      throw new Error("No KYC submission found. Please complete KYC verification first.");
    }
    
    const result = await submitKycForReview(user.customerId, user.kycData.submissionId);
    
    // Update KYC status in the user record to PENDING (as it's now under review)
    if (result.success) {
      await UserModel.updateKYCStatus(currentUser.email, 'PENDING');
    }
    
    return result;
  } catch (error) {
    logger.error("Error submitting KYC for review:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}