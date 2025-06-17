"use server"

import { getCurrentUser } from '@/utils/auth/auth';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { refreshKycStatus } from '@/app/actions/kyc/kyc-status';
import { logger } from '@/services/logger-service';
import type { KycLimitCheckResult } from '@/types/kyc';

/**
 * Checks if a transaction exceeds the user's KYC limits
 * @param quoteData The quote data from localStorage
 * @returns Object with limit check results
 */
export async function checkKycLimits(quoteData: any): Promise<KycLimitCheckResult> {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      throw new Error("User not authenticated");
    }
    
    // Refresh KYC status to get latest limits
    const kycStatus = await refreshKycStatus();
    
    if (!kycStatus.success) {
      throw new Error(kycStatus.message || "Failed to refresh KYC status");
    }
    
    // Get the exchange rates from database
    const db = await getDb();
    const configCollection = db.collection(COLLECTIONS.SETTINGS);
    const ratesConfig = await configCollection.findOne({ type: 'fiatExchangeRates' });
    
    if (!ratesConfig || !ratesConfig.rates) {
      throw new Error("Exchange rates not found in database");
    }
    
    // Extract transaction data
    const mode = quoteData.mode; // 'buy' or 'sell'
    const fromCurrency = quoteData.fromCurrency;
    const toCurrency = quoteData.toCurrency;
    
    // Determine the transaction currency and amount based on mode
    let transactionCurrency, transactionAmount;
    
    if (mode === 'buy') {
      // For buy mode, use the fiat currency (fromCurrency) and amount
      transactionCurrency = fromCurrency;
      transactionAmount = parseFloat(quoteData.fromAmount);
    } else {
      // For sell mode, use the fiat currency (toCurrency) and amount
      transactionCurrency = toCurrency;
      transactionAmount = parseFloat(quoteData.toAmount);
    }
    
    // Get the exchange rate for the transaction currency to EUR
    const rates = ratesConfig.rates;
    const baseCurrency = 'EUR'; // Exchange rates are based on EUR
    
    let exchangeRate = 1.0; // Default if currency is already EUR
    
    if (transactionCurrency !== baseCurrency) {
      // Find the exchange rate for the transaction currency
      if (!rates[transactionCurrency]) {
        throw new Error(`Exchange rate not found for ${transactionCurrency}`);
      }
      
      // Calculate the exchange rate to convert to EUR
      exchangeRate = 1 / rates[transactionCurrency];
    }
    
    // Convert the transaction amount to EUR for comparison with limits
    const transactionAmountEUR = transactionAmount * exchangeRate;
    
    logger.info(`Transaction amount in ${transactionCurrency}: ${transactionAmount}, in EUR: ${transactionAmountEUR}`);
    
    // Get the user's KYC level and limits
    const kycData = currentUser.kycData;
    const kycLevel = kycData?.kycLevel || 'Level 1';
    
    // If we don't have KYC limits from the API response, return an error
    if (!kycStatus.kycLimits || !kycStatus.kycLimits.current || !kycStatus.kycLimits.current.levelLimits) {
      throw new Error("KYC limits not found in API response");
    }
    
    // Get the current level limits
    const currentLevelLimits = kycStatus.kycLimits.current.levelLimits;
    
    // Sort the limits by the reserveAmount (directly available amount) 
    // This gives us the most restrictive limit first
    const sortedLimits = [...currentLevelLimits].sort((a, b) => {
      return a.reserveAmount - b.reserveAmount; // Ascending order - most restrictive first
    });
    
    // Get the most restrictive limit period
    const mostRestrictiveLimit = sortedLimits[0];
    
    // Get the direct available amount in EUR (reserveAmount)
    const availableAmountEUR = mostRestrictiveLimit.reserveAmount;
    
    // Convert available amount to the transaction currency
    const availableAmountInCurrency = availableAmountEUR / exchangeRate;
    
    // Get remaining transactions
    const remainingTransactions = mostRestrictiveLimit.reserveTransactions;
    
    // Determine the next KYC level name
    let nextLevelName = 'Level 2';
    if (kycLevel === 'Level 1') {
      nextLevelName = 'Level 2';
    } else if (kycLevel === 'Level 2') {
      nextLevelName = 'Level 3';
    } else {
      nextLevelName = 'Higher Level';
    }
    
    // Check if the limit is exceeded - only consider remainingTransactions if it's zero or less
    const limitExceeded = (remainingTransactions <= 0) || (transactionAmountEUR > availableAmountEUR);
    
    logger.info(`KYC limit check: limitExceeded=${limitExceeded}, availableAmountEUR=${availableAmountEUR}, transactionAmountEUR=${transactionAmountEUR}, remainingTransactions=${remainingTransactions}`);
    
    return {
      success: true,
      limitExceeded,
      currentAmount: transactionAmount,
      maxAllowedAmount: availableAmountInCurrency,
      currency: transactionCurrency,
      baseCurrency,
      exchangeRate,
      currentLevel: kycLevel,
      nextLevel: nextLevelName,
      period: mostRestrictiveLimit.period,
      remainingTransactions: remainingTransactions,
      message: limitExceeded ? 
        "Transaction exceeds your KYC limits" : 
        "Transaction is within your KYC limits"
    };
    
  } catch (error) {
    logger.error("Error checking KYC limits:", error);
    return {
      success: false,
      limitExceeded: false,
      message: error instanceof Error ? error.message : "Unknown error"
    } as KycLimitCheckResult;
  }
}