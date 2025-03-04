// src/utils/signature.ts
import crypto from "crypto"

/**
 * Generate HMAC-SHA256 signature for API requests
 * 
 * @param method HTTP method (GET, POST, etc.)
 * @param path API endpoint path
 * @returns Hex encoded signature
 */
export function generateSignature(method: string, path: string): string {
  const apiSecretKey = process.env.UNLIMIT_API_SECRET_KEY
  
  if (!apiSecretKey) {
    throw new Error("UNLIMIT_API_SECRET_KEY environment variable not set")
  }
  
  // Ensure method is uppercase
  const uppercaseMethod = method.toUpperCase()
  
  // Create the string to sign (method + path + payload if provided)
  let stringToSign = `${uppercaseMethod}${path}`

  
  // Create HMAC with SHA256
  const hmac = crypto.createHmac("sha256", apiSecretKey)
  hmac.update(stringToSign)
  
  // Return base64 encoded signature
  return hmac.digest("hex")
}

/**
 * Verify the signature of an incoming webhook or callback
 * 
 * @param signature The signature from the request header
 * @param body The raw request body as a string
 * @returns Boolean indicating if signature is valid
 */
export function verifySignature(signature: string, body: string): boolean {
  const apiSecretKey = process.env.UNLIMIT_API_SECRET_KEY
  
  if (!apiSecretKey) {
    throw new Error("UNLIMIT_API_SECRET_KEY environment variable not set")
  }
  
  // Create HMAC with SHA256
  const hmac = crypto.createHmac("sha256", apiSecretKey)
  hmac.update(body)
  
  // Generate expected signature
  const expectedSignature = hmac.digest("base64")
  
  // Compare signatures using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}