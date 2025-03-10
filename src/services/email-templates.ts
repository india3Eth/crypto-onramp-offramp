interface VerificationEmailData {
    otp: string;
  }
  
  interface WelcomeEmailData {
    firstName?: string;
    baseUrl: string;
  }
  
  /**
   * Email templates for the application
   */
  export const emailTemplates = {
    /**
     * Verification email with OTP code
     */
    verification: ({ otp }: VerificationEmailData): string => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1982FC; padding: 20px; border: 4px solid black; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Crypto Exchange</h1>
        </div>
        <div style="padding: 20px; border: 4px solid black; border-top: none; border-radius: 0 0 10px 10px;">
          <h2>Verify your email address</h2>
          <p>Enter the following verification code to complete your sign in:</p>
          <div style="background-color: #FFD600; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border: 3px solid black; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      </div>
    `,
  
    /**
     * Welcome email after successful registration
     */
    welcome: ({ firstName, baseUrl }: WelcomeEmailData): string => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1982FC; padding: 20px; border: 4px solid black; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Crypto Exchange</h1>
        </div>
        <div style="padding: 20px; border: 4px solid black; border-top: none; border-radius: 0 0 10px 10px;">
          <h2>Welcome${firstName ? ` ${firstName}` : ''}!</h2>
          <p>Thank you for joining Crypto Exchange. We're excited to have you on board!</p>
          <p>With our platform, you can:</p>
          <ul>
            <li>Buy and sell cryptocurrencies securely</li>
            <li>Track your transactions</li>
            <li>Get competitive exchange rates</li>
          </ul>
          <div style="margin: 20px 0;">
            <a href="${baseUrl}/exchange" 
               style="background-color: #00EA88; color: black; text-decoration: none; padding: 10px 20px; font-weight: bold; border: 3px solid black; border-radius: 5px; display: inline-block;">
              Start Trading Now
            </a>
          </div>
          <p>Need help? Contact our support team anytime.</p>
        </div>
      </div>
    `,
    
    /**
     * KYC approved email
     */
    kycApproved: ({ firstName, baseUrl }: WelcomeEmailData): string => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1982FC; padding: 20px; border: 4px solid black; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Crypto Exchange</h1>
        </div>
        <div style="padding: 20px; border: 4px solid black; border-top: none; border-radius: 0 0 10px 10px;">
          <h2>Identity Verification Approved!</h2>
          <p>Hi${firstName ? ` ${firstName}` : ''},</p>
          <p>Great news! Your identity verification has been approved. You now have full access to all trading features on our platform.</p>
          <div style="margin: 20px 0;">
            <a href="${baseUrl}/exchange" 
               style="background-color: #00EA88; color: black; text-decoration: none; padding: 10px 20px; font-weight: bold; border: 3px solid black; border-radius: 5px; display: inline-block;">
              Start Trading Now
            </a>
          </div>
          <p>Need help? Contact our support team anytime.</p>
        </div>
      </div>
    `,
  
    /**
     * KYC rejected email
     */
    kycRejected: ({ firstName, baseUrl, reason }: WelcomeEmailData & { reason?: string }): string => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1982FC; padding: 20px; border: 4px solid black; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Crypto Exchange</h1>
        </div>
        <div style="padding: 20px; border: 4px solid black; border-top: none; border-radius: 0 0 10px 10px;">
          <h2>Identity Verification Update Required</h2>
          <p>Hi${firstName ? ` ${firstName}` : ''},</p>
          <p>We reviewed your identity verification submission and need some additional information or corrections.</p>
          ${reason ? `<div style="background-color: #FFF3CD; padding: 15px; border: 2px solid #FFE69C; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold;">Reason:</p>
            <p style="margin: 10px 0 0 0;">${reason}</p>
          </div>` : ''}
          <div style="margin: 20px 0;">
            <a href="${baseUrl}/kyc" 
               style="background-color: #FF5252; color: white; text-decoration: none; padding: 10px 20px; font-weight: bold; border: 3px solid black; border-radius: 5px; display: inline-block;">
              Update Verification
            </a>
          </div>
          <p>Need help? Contact our support team for assistance with your verification.</p>
        </div>
      </div>
    `,
  };