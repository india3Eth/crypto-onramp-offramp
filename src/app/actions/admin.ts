"use server"

import { requireAdmin } from '@/middleware/admin-middleware';
import { getCollection, COLLECTIONS } from '@/lib/mongodb';
import { logger } from '@/services/logger-service';

interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Update crypto asset status (onramp/offramp)
 */
export async function updateCryptoStatus(
  cryptoId: string,
  type: "onramp" | "offramp",
  enabled: boolean
): Promise<ActionResult> {
  try {
    // Verify user is admin
    await requireAdmin();
    
    logger.info(`Updating crypto status: ${cryptoId}, ${type} => ${enabled}`);
    
    if (!cryptoId) {
      throw new Error("Crypto asset ID is required");
    }
    
    // Update field based on type
    const updateField = type === "onramp" ? "onRampSupported" : "offRampSupported";
    
    // Get collection and update the asset
    const collection = await getCollection(COLLECTIONS.CRYPTO);
    const result = await collection.updateOne(
      { id: cryptoId },
      { $set: { [updateField]: enabled } }
    );
    
    if (result.matchedCount === 0) {
      logger.warn(`Crypto asset not found: ${cryptoId}`);
      return {
        success: false,
        message: `Crypto asset with ID ${cryptoId} not found`
      };
    }
    
    logger.info(`Successfully updated crypto asset: ${cryptoId}, ${type} => ${enabled}`);
    
    return {
      success: true,
      message: `Successfully ${enabled ? 'enabled' : 'disabled'} ${type} for ${cryptoId}`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    logger.error(`Error updating crypto status for ${cryptoId}:`, error);
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Update payment method status (onramp/offramp)
 */
export async function updatePaymentMethodStatus(
  methodId: string,
  type: "onramp" | "offramp",
  enabled: boolean
): Promise<ActionResult> {
  try {
    // Verify user is admin
    await requireAdmin();
    
    logger.info(`Updating payment method status: ${methodId}, ${type} => ${enabled}`);
    
    if (!methodId) {
      throw new Error("Payment method ID is required");
    }
    
    // Update field based on type
    const updateField = type === "onramp" ? "onRampSupported" : "offRampSupported";
    
    // Get collection and update the payment method
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    const result = await collection.updateOne(
      { id: methodId },
      { $set: { [updateField]: enabled } }
    );
    
    if (result.matchedCount === 0) {
      logger.warn(`Payment method not found: ${methodId}`);
      return {
        success: false,
        message: `Payment method with ID ${methodId} not found`
      };
    }
    
    logger.info(`Successfully updated payment method: ${methodId}, ${type} => ${enabled}`);
    
    return {
      success: true,
      message: `Successfully ${enabled ? 'enabled' : 'disabled'} ${type} for ${methodId}`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    logger.error(`Error updating payment method status for ${methodId}:`, error);
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Update payment method supported countries
 */
export async function updatePaymentMethodCountries(
  methodId: string,
  countries: string[],
  action: "add" | "remove"
): Promise<ActionResult> {
  try {
    // Verify user is admin
    await requireAdmin();
    
    logger.info(`Updating payment method countries: ${methodId}, ${action} => ${countries.join(', ')}`);
    
    if (!methodId) {
      throw new Error("Payment method ID is required");
    }
    
    if (!countries.length) {
      throw new Error("At least one country must be specified");
    }
    
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    let result;
    
    if (action === "add") {
      // Add countries using $addToSet with $each
      result = await collection.updateOne(
        { id: methodId },
        { $addToSet: { availableCountries: { $each: countries } } }
      );
    } else {
      // For removing countries, we'll first get the current document
      const paymentMethod = await collection.findOne<{
        availableCountries: never[]; availableFiatCurrencies: string[] 
}>({ id: methodId });
      
      if (!paymentMethod) {
        logger.warn(`Payment method not found: ${methodId}`);
        return {
          success: false,
          message: `Payment method with ID ${methodId} not found`
        };
      }
      
      // Filter out the countries to be removed
      const updatedCountries = (paymentMethod.availableCountries || [])
        .filter((country: string) => !countries.includes(country));
      
      // Then set the entire array with the filtered list
      result = await collection.updateOne(
        { id: methodId },
        { $set: { availableCountries: updatedCountries } }
      );
    }
    
    if (result.matchedCount === 0) {
      logger.warn(`Payment method not found: ${methodId}`);
      return {
        success: false,
        message: `Payment method with ID ${methodId} not found`
      };
    }
    
    logger.info(`Successfully updated payment method countries: ${methodId}, ${action} => ${countries.join(', ')}`);
    
    return {
      success: true,
      message: `Successfully ${action === "add" ? 'added' : 'removed'} countries for ${methodId}`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    logger.error(`Error updating countries for ${methodId}:`, error);
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Update payment method supported currencies
 */
export async function updatePaymentMethodCurrencies(
  methodId: string,
  currencies: string[],
  action: "add" | "remove"
): Promise<ActionResult> {
  try {
    // Verify user is admin
    await requireAdmin();
    
    logger.info(`Updating payment method currencies: ${methodId}, ${action} => ${currencies.join(', ')}`);
    
    if (!methodId) {
      throw new Error("Payment method ID is required");
    }
    
    if (!currencies.length) {
      throw new Error("At least one currency must be specified");
    }
    
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    let result;
    
    if (action === "add") {
      // Add currencies using $addToSet with $each
      result = await collection.updateOne(
        { id: methodId },
        { $addToSet: { availableFiatCurrencies: { $each: currencies } } }
      );
    } else {
      // For removing currencies, we'll first get the current document
      const paymentMethod = await collection.findOne<{ availableFiatCurrencies: string[] }>({ id: methodId });
      
      if (!paymentMethod) {
        logger.warn(`Payment method not found: ${methodId}`);
        return {
          success: false,
          message: `Payment method with ID ${methodId} not found`
        };
      }
      
      // Filter out the currencies to be removed
      const updatedCurrencies = (paymentMethod.availableFiatCurrencies || [])
        .filter((currency: string) => !currencies.includes(currency));
      
      // Then set the entire array with the filtered list
      result = await collection.updateOne(
        { id: methodId },
        { $set: { availableFiatCurrencies: updatedCurrencies } }
      );
    }
    
    if (result.matchedCount === 0) {
      logger.warn(`Payment method not found: ${methodId}`);
      return {
        success: false,
        message: `Payment method with ID ${methodId} not found`
      };
    }
    
    logger.info(`Successfully updated payment method currencies: ${methodId}, ${action} => ${currencies.join(', ')}`);
    
    return {
      success: true,
      message: `Successfully ${action === "add" ? 'added' : 'removed'} currencies for ${methodId}`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    logger.error(`Error updating currencies for ${methodId}:`, error);
    
    return {
      success: false,
      message: errorMessage
    };
  }
}