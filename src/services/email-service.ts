import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Email Service using SendGrid
 */
export class EmailService {
  constructor() {
    // Set SendGrid API key from environment variable
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    console.log('SendGrid email service initialized');
  }

  /**
   * Send verification email with OTP code
   */
  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    const options: EmailOptions = {
      to: email,
      subject: 'Verify your email address',
      html: `
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
    };

    try {
      // Send email using SendGrid
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@your-domain.com',
        subject: options.subject,
        html: options.html,
      });
      
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Log more detailed error information
      // if (error.response) {
      //   console.error('SendGrid error details:', error.response.body);
      // }
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const options: EmailOptions = {
      to: email,
      subject: 'Welcome to Crypto Exchange',
      html: `
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
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/exchange" 
                 style="background-color: #00EA88; color: black; text-decoration: none; padding: 10px 20px; font-weight: bold; border: 3px solid black; border-radius: 5px; display: inline-block;">
                Start Trading Now
              </a>
            </div>
            <p>Need help? Contact our support team anytime.</p>
          </div>
        </div>
      `,
    };

    try {
      // Send email using SendGrid
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@your-domain.com',
        subject: options.subject,
        html: options.html,
      });
      
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Log more detailed error information
      // if (error.response) {
      //   console.error('SendGrid error details:', error.response.body);
      // }
      throw new Error('Failed to send welcome email');
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export for testing or custom instances
export default EmailService;