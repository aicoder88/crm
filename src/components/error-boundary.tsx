'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Log to error tracking service if available
        if (typeof window !== 'undefined') {
            // Could integrate with Sentry, LogRocket, etc.
            console.error('Error details:', {
                error: error.toString(),
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
            });
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Something went wrong
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            We encountered an unexpected error. Please try again.
                        </p>
                        {this.state.error && process.env.NODE_ENV === 'development' && (
                            <details className="text-xs">
                                <summary className="cursor-pointer font-medium">
                                    Error details (development only)
                                </summary>
                                <pre className="mt-2 overflow-auto rounded bg-muted p-2">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <Button onClick={this.handleReset} variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}
