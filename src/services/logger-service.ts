import { getLogsCollection } from '@/lib/mongodb';

// Log levels in order of increasing severity
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log entry interface
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  service?: string;
  stack?: string;
}

/**
 * Logger Service for centralized logging with MongoDB storage
 */
export class LoggerService {
  private readonly minLevel: LogLevel;
  private readonly enableConsole: boolean;
  private readonly service: string;
  
  constructor(options: {
    minLevel?: LogLevel;
    enableConsole?: boolean;
    service?: string;
  } = {}) {
    this.minLevel = options.minLevel || process.env.LOG_LEVEL as LogLevel || 'info';
    this.enableConsole = options.enableConsole ?? (process.env.NODE_ENV !== 'production');
    this.service = options.service || 'crypto-exchange';
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const minLevelIndex = levels.indexOf(this.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= minLevelIndex;
  }
  
  /**
   * Log a message with the specified level and context
   */
  async log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    options: {
      userId?: string;
      requestId?: string;
      stack?: string;
      skipDb?: boolean;
    } = {}
  ): Promise<void> {
    if (!this.shouldLog(level)) {
      return;
    }
    
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      userId: options.userId,
      requestId: options.requestId,
      service: this.service,
      stack: options.stack,
    };
    
    // Log to console if enabled
    if (this.enableConsole) {
      const consoleMethod = 
        level === 'error' ? console.error :
        level === 'warn' ? console.warn :
        level === 'info' ? console.info :
        console.debug;
      
      consoleMethod(
        `[${logEntry.timestamp.toISOString()}] [${level.toUpperCase()}] ${message}`,
        ...(context ? ['\nContext:', context] : []),
        ...(options.stack ? ['\nStack:', options.stack] : [])
      );
    }
    
    // Skip database logging if specified
    if (options.skipDb) {
      return;
    }
    
    try {
      // Store log in MongoDB asynchronously
      const logsCollection = await getLogsCollection();
      await logsCollection.insertOne(logEntry as any);
    } catch (error) {
      // Don't let logging errors affect the application flow
      // But do output to console if enabled
      if (this.enableConsole) {
        console.error('Failed to write log to database:', error);
      }
    }
  }
  
  /**
   * Log a debug message
   */
  async debug(message: string, context?: Record<string, any>, options?: { userId?: string; requestId?: string; skipDb?: boolean }): Promise<void> {
    return this.log('debug', message, context, options);
  }
  
  /**
   * Log an info message
   */
  async info(message: string, context?: Record<string, any>, options?: { userId?: string; requestId?: string; skipDb?: boolean }): Promise<void> {
    return this.log('info', message, context, options);
  }
  
  /**
   * Log a warning message
   */
  async warn(message: string, context?: Record<string, any>, options?: { userId?: string; requestId?: string; skipDb?: boolean }): Promise<void> {
    return this.log('warn', message, context, options);
  }
  
  /**
   * Log an error message
   */
  async error(message: string, error?: Error | unknown, context?: Record<string, any>, options?: { userId?: string; requestId?: string; skipDb?: boolean }): Promise<void> {
    const stack = error instanceof Error ? error.stack : undefined;
    return this.log('error', message, {
      ...(context || {}),
      ...(error instanceof Error ? { errorMessage: error.message, errorName: error.name } : {}),
      ...(error && typeof error === 'object' && error !== null ? { error } : {}),
    }, { 
      ...options,
      stack
    });
  }
}

// Export singleton instance
export const logger = new LoggerService();