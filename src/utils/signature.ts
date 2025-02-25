import crypto from "crypto"

export function generateSignature(method: string, path: string): string {
    const apiSecretKey = process.env.UNLIMIT_API_SECRET_KEY;
    if (!apiSecretKey) {
      throw new Error("UNLIMIT_API_SECRET_KEY environment variable not set.");
    }
  
    // Ensure method is uppercase as per documentation

    const dataToVerify = method.toUpperCase() + path;
  console.log(dataToVerify)
    // Create HMAC signature using SHA256
    const hmac = crypto.createHmac("sha256", apiSecretKey);
    hmac.update(dataToVerify);
    const signature = hmac.digest("hex");
  
    console.log("Signature:", signature);
    return signature;
  }
  