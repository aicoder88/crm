'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error('Global error caught', error instanceof Error ? error : new Error(String(error)));
        // Error is automatically sent to Sentry via logger
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex min-h-screen items-center justify-center bg-background p-4">
                    <div className="w-full max-w-md space-y-6 text-center">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-destructive/10 p-6">
                                <AlertCircle className="h-16 w-16 text-destructive" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Application Error
                            </h1>
                            <p className="text-muted-foreground">
                                Something went wrong. Please try refreshing the page.
                            </p>
                        </div>

                        <Button onClick={reset} size="lg">
                            Refresh Page
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
