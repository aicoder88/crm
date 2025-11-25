import * as Sentry from "@sentry/nextjs";

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
    userId?: string;
    customerContext?: {
        customerId: string;
        customerName?: string;
    };
    operationContext?: {
        operation: string;
        params?: Record<string, any>;
    };
    apiContext?: {
        endpoint: string;
        method: string;
        statusCode?: number;
    };
    featureContext?: {
        feature: string;
        component?: string;
    };
}

export class ErrorTracker {
    static captureError(
        error: Error | string,
        severity: ErrorSeverity = 'medium',
        context?: ErrorContext
    ) {
        // Always log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error captured:', error, context);
        }

        // Send to Sentry if configured
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
            Sentry.withScope((scope) => {
                // Set severity level
                scope.setLevel(this.mapSeverityToSentryLevel(severity));

                // Add context
                if (context) {
                    if (context.userId) {
                        scope.setUser({ id: context.userId });
                    }

                    if (context.customerContext) {
                        scope.setTag('customer_id', context.customerContext.customerId);
                        scope.setContext('customer', context.customerContext);
                    }

                    if (context.operationContext) {
                        scope.setTag('operation', context.operationContext.operation);
                        scope.setContext('operation', context.operationContext);
                    }

                    if (context.apiContext) {
                        scope.setTag('api_endpoint', context.apiContext.endpoint);
                        scope.setTag('http_method', context.apiContext.method);
                        if (context.apiContext.statusCode) {
                            scope.setTag('status_code', context.apiContext.statusCode);
                        }
                        scope.setContext('api', context.apiContext);
                    }

                    if (context.featureContext) {
                        scope.setTag('feature', context.featureContext.feature);
                        if (context.featureContext.component) {
                            scope.setTag('component', context.featureContext.component);
                        }
                        scope.setContext('feature', context.featureContext);
                    }
                }

                // Capture the error
                if (typeof error === 'string') {
                    Sentry.captureMessage(error);
                } else {
                    Sentry.captureException(error);
                }
            });
        }
    }

    static captureApiError(
        error: Error | string,
        endpoint: string,
        method: string,
        statusCode?: number,
        additionalContext?: Omit<ErrorContext, 'apiContext'>
    ) {
        this.captureError(
            error,
            statusCode && statusCode >= 500 ? 'high' : 'medium',
            {
                ...additionalContext,
                apiContext: {
                    endpoint,
                    method,
                    statusCode,
                },
            }
        );
    }

    static captureDatabaseError(
        error: Error | string,
        operation: string,
        params?: Record<string, any>,
        additionalContext?: Omit<ErrorContext, 'operationContext'>
    ) {
        this.captureError(
            error,
            'high',
            {
                ...additionalContext,
                operationContext: {
                    operation: `database:${operation}`,
                    params,
                },
            }
        );
    }

    static captureBusinessLogicError(
        error: Error | string,
        feature: string,
        component?: string,
        additionalContext?: Omit<ErrorContext, 'featureContext'>
    ) {
        this.captureError(
            error,
            'medium',
            {
                ...additionalContext,
                featureContext: {
                    feature,
                    component,
                },
            }
        );
    }

    static setUserContext(userId: string, email?: string, role?: string) {
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
            Sentry.setUser({
                id: userId,
                email,
                role,
            });
        }
    }

    static clearUserContext() {
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
            Sentry.setUser(null);
        }
    }

    static addBreadcrumb(
        message: string,
        category: string = 'default',
        level: 'debug' | 'info' | 'warning' | 'error' = 'info',
        data?: Record<string, any>
    ) {
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
            Sentry.addBreadcrumb({
                message,
                category,
                level,
                data,
                timestamp: Date.now() / 1000,
            });
        }
    }

    private static mapSeverityToSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
        switch (severity) {
            case 'low':
                return 'info';
            case 'medium':
                return 'warning';
            case 'high':
                return 'error';
            case 'critical':
                return 'fatal';
            default:
                return 'error';
        }
    }
}

// Convenience functions for common use cases
export const captureError = ErrorTracker.captureError;
export const captureApiError = ErrorTracker.captureApiError;
export const captureDatabaseError = ErrorTracker.captureDatabaseError;
export const captureBusinessLogicError = ErrorTracker.captureBusinessLogicError;
export const setUserContext = ErrorTracker.setUserContext;
export const clearUserContext = ErrorTracker.clearUserContext;
export const addBreadcrumb = ErrorTracker.addBreadcrumb;