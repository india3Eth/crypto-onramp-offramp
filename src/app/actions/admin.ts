"use server"

import { ObjectId } from 'mongodb';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { getCurrentUser } from '@/utils/auth';

// Update crypto asset status (onramp/offramp)
export async function updateCryptoStatus(
  cryptoId: string,
  type: "onramp" | "offramp",
  enabled: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify user is admin (you'll need to implement proper admin checks)
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Authentication required"
      };
    }
    
    // Connect to MongoDB
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.CRYPTO);
    
    // Update field based on type
    const updateField = type === "onramp" ? "onRampSupported" : "offRampSupported";
    
    // Update the asset
    const result = await collection.updateOne(
      { id: cryptoId },
      { $set: { [updateField]: enabled } }
    );
    
    if (result.matchedCount === 0) {
      return {
        success: false,
        message: `Crypto asset with ID ${cryptoId} not found`
      };
    }
    
    return {
      success: true,
      message: `Successfully ${enabled ? 'enabled' : 'disabled'} ${type} for ${cryptoId}`
    };
  } catch (error) {
    console.error(`Error updating crypto status for ${cryptoId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

// Update payment method status (onramp/offramp)
export async function updatePaymentMethodStatus(
  methodId: string,
  type: "onramp" | "offramp",
  enabled: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify user is admin (you'll need to implement proper admin checks)
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Authentication required"
      };
    }
    
    // Connect to MongoDB
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.PAYMENTS);
    
    // Update field based on type
    const updateField = type === "onramp" ? "onRampSupported" : "offRampSupported";
    
    // Update the payment method
    const result = await collection.updateOne(
      { id: methodId },
      { $set: { [updateField]: enabled } }
    );
    
    if (result.matchedCount === 0) {
      return {
        success: false,
        message: `Payment method with ID ${methodId} not found`
      };
    }
    
    return {
      success: true,
      message: `Successfully ${enabled ? 'enabled' : 'disabled'} ${type} for ${methodId}`
    };
  } catch (error) {
    console.error(`Error updating payment method status for ${methodId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

// Add/remove countries from a payment method
export async function updatePaymentMethodCountries(
  methodId: string,
  countries: string[],
  action: "add" | "remove"
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify user is admin
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Authentication required"
      };
    }
    
    // Connect to MongoDB
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.PAYMENTS);
    
    let result;
    
    if (action === "add") {
      // Add countries using $addToSet with $each
      result = await collection.updateOne(
        { id: methodId },
        { $addToSet: { availableCountries: { $each: countries } } }
      );
    } else {
      // For removing countries, we'll first get the current document
      const paymentMethod = await collection.findOne({ id: methodId });
      
      if (!paymentMethod) {
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
      return {
        success: false,
        message: `Payment method with ID ${methodId} not found`
      };
    }
    
    return {
      success: true,
      message: `Successfully ${action === "add" ? 'added' : 'removed'} countries for ${methodId}`
    };
  } catch (error) {
    console.error(`Error updating countries for ${methodId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

// Add/remove currencies from a payment method
export async function updatePaymentMethodCurrencies(
  methodId: string,
  currencies: string[],
  action: "add" | "remove"
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify user is admin
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Authentication required"
      };
    }
    
    // Connect to MongoDB
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.PAYMENTS);
    
    let result;
    
    if (action === "add") {
      // Add currencies using $addToSet with $each
      result = await collection.updateOne(
        { id: methodId },
        { $addToSet: { availableFiatCurrencies: { $each: currencies } } }
      );
    } else {
      // For removing currencies, we'll first get the current document
      const paymentMethod = await collection.findOne({ id: methodId });
      
      if (!paymentMethod) {
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
      return {
        success: false,
        message: `Payment method with ID ${methodId} not found`
      };
    }
    
    return {
      success: true,
      message: `Successfully ${action === "add" ? 'added' : 'removed'} currencies for ${methodId}`
    };
  } catch (error) {
    console.error(`Error updating currencies for ${methodId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}