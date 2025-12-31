/**
 * Structured Logging Utility for Purrify CRM
 * 
 * Provides consistent logging across the application with support for
 * different log levels and production-ready integration.
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface LogContext {
    [key: string]: unknown;
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: Error;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';
    private minLevel: LogLevel;

    constructor() {
        // Set minimum log level based on environment
        this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        return levels.indexOf(level) >= levels.indexOf(this.minLevel);
    }

    private formatLog(entry: LogEntry): void {
        if (!this.shouldLog(entry.level)) {
            return;
        }

        const { level, message, timestamp, context, error } = entry;

        // In production, you can send logs to a service like Sentry, LogRocket, or Datadog
        // For now, we'll use structured console logging

        const logData = {
            level,
            message,
            timestamp,
            ...(context && { context }),
            ...(error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            }),
        };

        switch (level) {
            case LogLevel.DEBUG:
                if (this.isDevelopment) {
                    console.debug(`[DEBUG] ${message}`, context || '');
                }
                break;
            case LogLevel.INFO:
                console.info(`[INFO] ${message}`, context || '');
                break;
            case LogLevel.WARN:
                console.warn(`[WARN] ${message}`, context || '');
                break;
            case LogLevel.ERROR:
                console.error(`[ERROR] ${message}`, error || context || '');
                break;
        }

        // In production, send to external logging service
        if (!this.isDevelopment && process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_LOGGING === 'true') {
            this.sendToExternalService(logData);
        }
    }

    private sendToExternalService(logData: Record<string, unknown>): void {
        // Placeholder for external logging service integration
        // Examples: Sentry, LogRocket, Datadog, CloudWatch, etc.
        // Implementation would go here
    }

    debug(message: string, context?: LogContext): void {
        this.formatLog({
            level: LogLevel.DEBUG,
            message,
            timestamp: new Date().toISOString(),
            context,
        });
    }

    info(message: string, context?: LogContext): void {
        this.formatLog({
            level: LogLevel.INFO,
            message,
            timestamp: new Date().toISOString(),
            context,
        });
    }

    warn(message: string, context?: LogContext): void {
        this.formatLog({
            level: LogLevel.WARN,
            message,
            timestamp: new Date().toISOString(),
            context,
        });
    }

    error(message: string, error?: Error, context?: LogContext): void {
        this.formatLog({
            level: LogLevel.ERROR,
            message,
            timestamp: new Date().toISOString(),
            context,
            error,
        });
    }

    /**
     * Create a child logger with additional context
     * Useful for request-specific logging
     */
    child(defaultContext: LogContext): Logger {
        const childLogger = new Logger();
        const originalFormatLog = childLogger.formatLog.bind(childLogger);

        childLogger.formatLog = (entry: LogEntry) => {
            originalFormatLog({
                ...entry,
                context: { ...defaultContext, ...entry.context },
            });
        };

        return childLogger;
    }
}

// Export a singleton instance
export const logger = new Logger();

// Export createLogger for creating context-specific loggers
export function createLogger(context: LogContext): Logger {
    return logger.child(context);
}
