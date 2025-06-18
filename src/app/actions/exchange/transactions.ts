"use server"

import { generateSignature } from '@/utils/crypto/signature';
import { getCurrentUser } from '@/utils/auth/auth';
import { UserModel } from '@/models/user';
import { logger } from '@/services/logger-service';
import type { OnrampTransactionsResponse, OfframpTransactionsResponse } from '@/types/exchange/transaction';

interface GetTransactionsParams {
  startDate?: string; // ISO string
  endDate?: string; // ISO string  
  pageSize?: number;
  pageOffset?: number;
}

/**
 * Get onramp transactions for the current user
 */
export async function getOnrampTransactions(params: GetTransactionsParams = {}) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      return {
        success: false,
        message: "User not authenticated"
      };
    }
    
    // Get user with customerId
    const user = await UserModel.getUserByEmail(currentUser.email);
    
    if (!user || !user.customerId) {
      return {
        success: false,
        message: "Customer profile not found. Please create a customer profile first."
      };
    }
    
    // Set default parameters
    const {
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      endDate = new Date().toISOString(), // now
      pageSize = 20,
      pageOffset = 0
    } = params;
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      pageSize: pageSize.toString(),
      pageOffset: pageOffset.toString(),
      customerID: user.customerId
    });
    
    // Generate signature for the base path (without query parameters)
    const basePath = '/v1/external/onramp';
    const signature = generateSignature('GET', basePath);
    
    // API configuration
    const apiKey = process.env.UNLIMIT_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        message: "API Key is missing"
      };
    }
    
    const apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com";
    const fullUrl = `${apiBaseUrl}${basePath}?${queryParams.toString()}`;
    
    logger.info(`Fetching onramp transactions for customer: ${user.customerId}`, {
      email: currentUser.email,
      startDate,
      endDate,
      pageSize,
      pageOffset
    });
    
    // Make API request
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "signature": signature,
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error("Failed to fetch onramp transactions", errorData);
      return {
        success: false,
        message: `Failed to fetch transactions: ${response.statusText}`
      };
    }
    
    const data: OnrampTransactionsResponse = await response.json();
    
    logger.info(`Successfully fetched ${data.transactions.length} onramp transactions for customer: ${user.customerId}`);
    
    return {
      success: true,
      message: "Onramp transactions fetched successfully",
      transactions: data.transactions,
      pagination: {
        pageSize,
        pageOffset,
        hasMore: data.transactions.length === pageSize
      }
    };
    
  } catch (error) {
    logger.error("Error fetching onramp transactions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Get offramp transactions for the current user
 */
export async function getOfframpTransactions(params: GetTransactionsParams = {}) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      return {
        success: false,
        message: "User not authenticated"
      };
    }
    
    // Get user with customerId
    const user = await UserModel.getUserByEmail(currentUser.email);
    
    if (!user || !user.customerId) {
      return {
        success: false,
        message: "Customer profile not found. Please create a customer profile first."
      };
    }
    
    // Set default parameters
    const {
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      endDate = new Date().toISOString(), // now
      pageSize = 20,
      pageOffset = 0
    } = params;
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      pageSize: pageSize.toString(),
      pageOffset: pageOffset.toString(),
      customerID: user.customerId
    });
    
    // Generate signature for the base path (without query parameters)
    const basePath = '/v1/external/offramp';
    const signature = generateSignature('GET', basePath);
    
    // API configuration
    const apiKey = process.env.UNLIMIT_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        message: "API Key is missing"
      };
    }
    
    const apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com";
    const fullUrl = `${apiBaseUrl}${basePath}?${queryParams.toString()}`;
    
    logger.info(`Fetching offramp transactions for customer: ${user.customerId}`, {
      email: currentUser.email,
      startDate,
      endDate,
      pageSize,
      pageOffset
    });
    
    // Make API request
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "signature": signature,
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error("Failed to fetch offramp transactions", errorData);
      return {
        success: false,
        message: `Failed to fetch transactions: ${response.statusText}`
      };
    }
    
    const data: OfframpTransactionsResponse = await response.json();
    
    logger.info(`Successfully fetched ${data.transactions.length} offramp transactions for customer: ${user.customerId}`);
    
    return {
      success: true,
      message: "Offramp transactions fetched successfully",
      transactions: data.transactions,
      pagination: {
        pageSize,
        pageOffset,
        hasMore: data.transactions.length === pageSize
      }
    };
    
  } catch (error) {
    logger.error("Error fetching offramp transactions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: errorMessage
    };
  }
}