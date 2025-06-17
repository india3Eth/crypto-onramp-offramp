/**
 * Utility for generating and managing device IDs
 * Uses the Fingerprint.js library loaded via CDN
 */

const DEVICE_ID_KEY = 'crypto_exchange_device_id';

declare global {
  interface Window {
    FPTS: {
      getBrowserHash: () => Promise<string>;
    };
  }
}

/**
 * Checks if code is running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Generate a random device ID
 * @returns A random string to use as device ID
 */
export function generateRandomDeviceId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Gets or generates a device ID for the current browser
 * @returns Promise that resolves to a device ID string
 */
export async function getDeviceId(): Promise<string> {
  // Check if we're in a browser environment
  if (!isBrowser()) {
    // If on server, generate a random ID
    return generateRandomDeviceId();
  }

  // Check if we already have a device ID in localStorage
  const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (storedDeviceId) {
    return storedDeviceId;
  }

  // Check if the FPTS library is loaded
  if (window.FPTS) {
    try {
      // Generate new device ID using the Fingerprint.js library
      const deviceId = await window.FPTS.getBrowserHash();
      
      // Store the device ID in localStorage for future use
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
      
      return deviceId;
    } catch (error) {
      console.error('Failed to generate device ID:', error);
    }
  }

  // If fingerprinting fails or isn't available, use a fallback ID
  const fallbackId = generateRandomDeviceId();
  localStorage.setItem(DEVICE_ID_KEY, fallbackId);
  return fallbackId;
}