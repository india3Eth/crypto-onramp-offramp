"use server"

import { generateSignature } from '@/utils/signature';
import { UserModel } from '@/models/user';
import { getCurrentUser } from '@/utils/auth';
import { logger } from '@/services/logger-service';

interface KYCWidgetUrlResponse {
  kycUrl: string;
  submissionId: string;
}

interface AuthTokenResponse {
  authToken: string;
}

/**
 * Get KYC widget URL with authentication token for a specific KYC level
 */
export async function getKycWidgetUrl(
  kycLevel: number = 2,
  successUrl: string = '/profile', 
  cancelUrl: string = '/profile'
): Promise<{ 
  success: boolean; 
  message: string; 
  fullUrl?: string;
  submissionId?: string;
}> {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      throw new Error("User not authenticated");
    }
    
    // Get full user data including customerId
    const user = await UserModel.getUserByEmail(currentUser.email);
    
    if (!user || !user.customerId) {
      throw new Error("Customer profile not found. Please create a customer profile first.");
    }
    
    // Get base URL for redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.google.com';
    const fullSuccessUrl = `${baseUrl}${successUrl}`;
    const fullCancelUrl = `${baseUrl}${cancelUrl}`;
    
    // 1. Generate KYC widget URL
    const widgetUrlPath = `/v1/external/customers/${user.customerId}/kyc/widgetUrl`;
    const widgetUrlSignature = generateSignature('POST', widgetUrlPath);
    console.log(widgetUrlSignature);
    // API key is required
    const apiKey = process.env.UNLIMIT_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }
    
    const apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com";
    
    logger.info(`Generating KYC widget URL for customer: ${user.customerId}`, { 
      email: currentUser.email,
      kycLevel
    });
    
    // Make API request to get widget URL
    const widgetUrlResponse = await fetch(`${apiBaseUrl}${widgetUrlPath}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "signature": widgetUrlSignature,
      },
      body: JSON.stringify({
        SuccessUrl: "https://www.google.com/",
        CancelUrl: "https://www.google.com/"
      }),
    });
    
    if (!widgetUrlResponse.ok) {
      const errorData = await widgetUrlResponse.json().catch(() => null);
      logger.error("Failed to get KYC widget URL", errorData);
      throw new Error(`Failed to get KYC widget URL: ${widgetUrlResponse.statusText}`);
    }
    
    // Parse response to get the widget URL
    const widgetData: KYCWidgetUrlResponse = await widgetUrlResponse.json();
    
    // 2. Get auth token
    const authTokenPath = `/v1/external/auth-token?customerId=${user.customerId}`;
    const authTokenSignature = generateSignature('POST', '/v1/external/auth-token');
    // Make API request to get auth token
    const authTokenResponse = await fetch(`${apiBaseUrl}${authTokenPath}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "signature": authTokenSignature,
      },
    });
    
    if (!authTokenResponse.ok) {
      const errorData = await authTokenResponse.json().catch(() => null);
      logger.error("Failed to get auth token", errorData);
      throw new Error(`Failed to get auth token: ${authTokenResponse.statusText}`);
    }
    
    // Parse response to get the auth token
    const authData: AuthTokenResponse = await authTokenResponse.json();
    
    // 3. Construct the full KYC URL
    // First extract the base URL and query parameters
    let kycUrl = widgetData.kycUrl;
    
    // Modify the KYC level if needed
    kycUrl = kycUrl.replace(/ucLevel=Level\+\d+/, `ucLevel=Level+${kycLevel}`);
    
    // Add auth token to the URL
    const separator = kycUrl.includes('?') ? '&' : '?';
    const fullKycUrl = `${kycUrl}${separator}ucToken=${authData.authToken}`;
    
    // Store the submissionId in the user's KYC data
    await UserModel.updateKYCData(currentUser.email, {
      ...(user.kycData || {}),
      submissionId: widgetData.submissionId
    }, 'PENDING');
    
    logger.info(`KYC widget URL generated successfully for customer: ${user.customerId}`, { 
      submissionId: widgetData.submissionId
    });
    
    return { 
      success: true, 
      message: "KYC widget URL generated successfully", 
      fullUrl: fullKycUrl,
      submissionId: widgetData.submissionId
    };
  } catch (error) {
    logger.error("Error generating KYC widget URL:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}