/**
 * Environment variables validation
 * Checks that all required environment variables are set
 */

interface EnvVar {
    name: string;
    required: boolean;
    defaultValue?: string;
    description: string;
  }
  
  // Define all environment variables used in the application
  const envVars: EnvVar[] = [
    {
      name: 'MONGODB_URI',
      required: true,
      description: 'MongoDB connection URI'
    },
    {
      name: 'MONGODB_DB_NAME',
      required: false,
      defaultValue: 'crypto-exchange',
      description: 'MongoDB database name'
    },
    {
      name: 'JWT_SECRET',
      required: true,
      description: 'Secret key for JWT tokens'
    },
    {
      name: 'SENDGRID_API_KEY',
      required: true,
      description: 'SendGrid API key for sending emails'
    },
    {
      name: 'SENDGRID_FROM_EMAIL',
      required: true,
      description: 'Email address to send emails from'
    },
    {
      name: 'UNLIMIT_API_KEY',
      required: true,
      description: 'API key for Unlimit API'
    },
    {
      name: 'UNLIMIT_API_SECRET_KEY',
      required: true,
      description: 'API secret key for Unlimit API'
    },
    {
      name: 'UNLIMIT_API_BASE_URL',
      required: false,
      defaultValue: 'https://api-sandbox.gatefi.com',
      description: 'Base URL for Unlimit API'
    },
    {
      name: 'NEXT_PUBLIC_BASE_URL',
      required: false,
      defaultValue: 'http://localhost:3000',
      description: 'Base URL of the application'
    },
    {
      name: 'LOG_LEVEL',
      required: false,
      defaultValue: 'info',
      description: 'Minimum log level to display (debug, info, warn, error)'
    },
  ];
  
  /**
   * Validate all environment variables
   * @returns Array of error messages for missing required variables
   */
  export function validateEnv(): string[] {
    const errors: string[] = [];
    
    for (const envVar of envVars) {
      const value = process.env[envVar.name];
      
      // Check if the variable is set or has a default value
      if (!value && !envVar.defaultValue && envVar.required) {
        errors.push(`Missing required environment variable: ${envVar.name} - ${envVar.description}`);
      }
      
      // Set default value if not set
      if (!value && envVar.defaultValue) {
        process.env[envVar.name] = envVar.defaultValue;
      }
    }
    
    return errors;
  }
  
  /**
   * Get a formatted list of all environment variables
   * @returns Object with environment variable status
   */
  export function getEnvStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    
    for (const envVar of envVars) {
      const value = process.env[envVar.name];
      
      if (value) {
        // Mask sensitive values
        const isSensitive = envVar.name.includes('SECRET') || 
                            envVar.name.includes('KEY') || 
                            envVar.name.includes('PASSWORD');
        
        status[envVar.name] = isSensitive ? 'Set (hidden)' : value;
      } else if (envVar.defaultValue) {
        status[envVar.name] = `Using default: ${envVar.defaultValue}`;
      } else if (envVar.required) {
        status[envVar.name] = 'MISSING (REQUIRED)';
      } else {
        status[envVar.name] = 'Not set (optional)';
      }
    }
    
    return status;
  }
  
  /**
   * Validate environment variables at startup and log errors
   */
  export function validateEnvOnStartup(): void {
    const errors = validateEnv();
    
    if (errors.length > 0) {
      console.error('Environment validation failed:');
      for (const error of errors) {
        console.error(`- ${error}`);
      }
      
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Missing required environment variables. Cannot start in production mode.');
      } else {
        console.warn('Application may not function correctly due to missing environment variables.');
      }
    } else {
      console.log('Environment validation passed.');
    }
  }