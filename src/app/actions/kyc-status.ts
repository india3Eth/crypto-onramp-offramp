"use server"

import { generateSignature } from '@/utils/signature';
import { UserModel } from '@/models/user';
import { getCurrentUser } from '@/utils/auth';
import { logger } from '@/services/logger-service';

interface KYCStatusResponse {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  status: string;
  kyc: {
    current: {
      levelName: string;
      levelLimits: Array<{
        reserveTransactions: number;
        reserveAmount: number;
        maxTransactions: number;
        maxAmount: number;
        period: string;
      }>;
    };
    next: {
      levelNames: string[] | null;
      levelLimits: any | null;
    };
  };
}

/**
 * Server action to fetch the latest KYC status from the external API
 */
export async function refreshKycStatus(
  forLevel?: number // Optionally refresh status for a specific level
): Promise<{
  success: boolean;
  message: string;
  kycLevel?: string;
  kycStatus?: string;
}> {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      return {
        success: false,
        message: "User not authenticated"
      };
    }
    
    // Get full user data including customerId and submissionId
    const user = await UserModel.getUserByEmail(currentUser.email);
    
    if (!user || !user.customerId) {
      return {
        success: false,
        message: "Customer profile not found. Please create a customer profile first."
      };
    }
    
    if (!user.kycData?.submissionId) {
      return {
        success: false,
        message: "No KYC submission found. Please complete KYC verification first."
      };
    }
    
    // Generate signature for API call
    const method = "GET";
    const path = `/v1/external/customers/${user.customerId}/kyc/${user.kycData.submissionId}/status`;
    const signature = generateSignature(method, path);
    
    // API key is required
    const apiKey = process.env.UNLIMIT_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        message: "API Key is missing"
      };
    }
    
    const apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com";
    
    logger.info(`Fetching KYC status for customer: ${user.customerId}`, { 
      email: currentUser.email,
      submissionId: user.kycData.submissionId,
      forLevel
    });
    
    // Make API request
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "signature": signature,
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error("Failed to fetch KYC status", errorData);
      return {
        success: false,
        message: `Failed to fetch KYC status: ${response.statusText}`
      };
    }
    
    // Parse response
    const statusData: KYCStatusResponse = await response.json();
    
    console.log("KYC Status API Response:", JSON.stringify(statusData, null, 2));
    
    // Map API status to our internal status
    let kycStatus: string;
    switch (statusData.status) {
      case "CREATED":
      case "SUBMITTED":
        kycStatus = "PENDING";
        break;
      case "COMPLETED":
        kycStatus = "COMPLETED";
        break;
      case "REJECTED":
        kycStatus = "FAILED";
        break;
      case "UPDATE_REQUIRED":
        kycStatus = "UPDATE_REQUIRED";
        break;
      default:
        kycStatus = statusData.status;
    }
    
    // Extract the KYC level from the response
    const kycLevel = statusData.kyc?.current?.levelName || "Level 1";
    
    // If refreshing for a specific level, check if the user has that level
    if (forLevel) {
      const userLevelNumber = kycLevel.includes('Level') ? 
        parseInt(kycLevel.replace('Level', '').trim()) : 0;
      
      // If requested level is higher than user's current level
      if (userLevelNumber < forLevel) {
        // User hasn't completed this level yet
        return {
          success: false,
          message: `You need to complete Level ${forLevel} verification first.`
        };
      }
    }
    
    // Update user's KYC status and level in the database
    await UserModel.updateKYCStatus(
      currentUser.email, 
      kycStatus as any,
      null, // No status reason in this endpoint
      kycLevel  // Add the KYC level
    );
    
    logger.info(`KYC status refreshed successfully for customer: ${user.customerId}`, { 
      status: kycStatus,
      level: kycLevel
    });
    
    return { 
      success: true, 
      message: "KYC status refreshed successfully", 
      kycLevel,
      kycStatus
    };
  } catch (error) {
    logger.error("Error refreshing KYC status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { 
      success: false, 
      message: errorMessage 
    };
  }
}