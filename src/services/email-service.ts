import sgMail from '@sendgrid/mail';
import { emailTemplates } from './email-templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailServiceError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

/**
 * Email Service using SendGrid
 */
export class EmailService {
  private readonly fromEmail: string;
  private readonly baseUrl: string;
  
  constructor() {
    // Set SendGrid API key from environment variable
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      console.warn('SENDGRID_API_KEY not set. Email service will not work properly.');
    } else {
      sgMail.setApiKey(apiKey);
    }
    
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@crypto-exchange.com';
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    console.log('Email service initialized with from address:', this.fromEmail);
  }

  /**
   * Send an email using SendGrid
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Send email using SendGrid
      await sgMail.send({
        to: options.to,
        from: this.fromEmail,
        subject: options.subject,
        html: options.html,
      });
      
      console.log(`Email sent to ${options.to} with subject: ${options.subject}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      
      // Log more detailed error information when available
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('SendGrid error details:', (error as any).response?.body);
      }
      
      throw new EmailServiceError('Failed to send email', error);
    }
  }

  /**
   * Send verification email with OTP code
   */
  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    const options: EmailOptions = {
      to: email,
      subject: 'Verify your email address',
      html: emailTemplates.verification({ otp }),
    };

    return this.sendEmail(options);
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const options: EmailOptions = {
      to: email,
      subject: 'Welcome to Crypto Exchange',
      html: emailTemplates.welcome({ 
        firstName,
        baseUrl: this.baseUrl
      }),
    };

    return this.sendEmail(options);
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export for testing or custom instances
export default EmailService;