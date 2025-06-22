"use server"

import { getCurrentUser } from '@/utils/auth/auth';
import { UserModel } from '@/models/user';
import { logger } from '@/services/logger-service';
import { fiatAccountService } from '@/services/fiat-account-service';
import type { FiatAccount, FiatAccountField } from '@/services/fiat-account-service';

interface CreateFiatAccountResult {
  success: boolean;
  message: string;
  fiatAccountId?: string;
}

interface GetFiatAccountsResult {
  success: boolean;
  message: string;
  fiatAccounts?: FiatAccount[];
}

/**
 * Server action to create a new SEPA fiat account
 */
export async function createSEPAAccount(
  accountFields: FiatAccountField
): Promise<CreateFiatAccountResult> {
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

    // Validate required fields for SEPA account
    if (!accountFields.accountNumber || !accountFields.recipientFullAddress || !accountFields.recipientAddressCountry) {
      return {
        success: false,
        message: "All SEPA account fields are required: IBAN, address, and country."
      };
    }

    // Validate IBAN format (basic check)
    const iban = accountFields.accountNumber.replace(/\s/g, '').toUpperCase();
    if (!iban.match(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/)) {
      return {
        success: false,
        message: "Please enter a valid IBAN number."
      };
    }

    // Validate country code
    if (!accountFields.recipientAddressCountry.match(/^[A-Z]{2}$/)) {
      return {
        success: false,
        message: "Please enter a valid 2-letter country code (e.g., BE, DE, FR)."
      };
    }
    
    logger.info(`Creating SEPA account for customer: ${user.customerId}`, { 
      email: currentUser.email,
      country: accountFields.recipientAddressCountry
    });
    
    // Call the fiat account service to create the account
    const response = await fiatAccountService.createSEPAAccount(user.customerId, {
      accountNumber: iban,
      recipientFullAddress: accountFields.recipientFullAddress,
      recipientAddressCountry: accountFields.recipientAddressCountry
    });
    
    logger.info(`SEPA account created successfully`, {
      fiatAccountId: response.fiatAccountId,
      customerId: user.customerId
    });
    
    return { 
      success: true, 
      message: "SEPA account added successfully", 
      fiatAccountId: response.fiatAccountId
    };
  } catch (error) {
    logger.error("Error creating SEPA account:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}

/**
 * Server action to get all fiat accounts for the current user
 */
export async function getUserFiatAccounts(): Promise<GetFiatAccountsResult> {
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
    
    logger.info(`Fetching fiat accounts for customer: ${user.customerId}`, { 
      email: currentUser.email
    });
    
    // Call the fiat account service to get accounts
    const fiatAccounts = await fiatAccountService.getUserFiatAccounts(user.customerId);
    
    logger.info(`Fetched ${fiatAccounts.length} fiat accounts`, {
      customerId: user.customerId,
      accountCount: fiatAccounts.length
    });
    
    return { 
      success: true, 
      message: "Fiat accounts retrieved successfully", 
      fiatAccounts
    };
  } catch (error) {
    logger.error("Error fetching fiat accounts:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}