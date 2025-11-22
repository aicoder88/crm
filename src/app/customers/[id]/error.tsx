'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Customer page error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-6">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Unable to Load Customer
                    </h1>
                    <p className="text-muted-foreground">
                        We encountered an error while loading this customer's information.
                        Please try again or return to the customers list.
                    </p>
                </div>

                {process.env.NODE_ENV === 'development' && error.message && (
                    <details className="rounded-lg border bg-muted/50 p-4 text-left">
                        <summary className="cursor-pointer text-sm font-medium">
                            Error Details (Development)
                        </summary>
                        <pre className="mt-2 overflow-auto text-xs">
                            {error.message}
                            {error.digest && `\nDigest: ${error.digest}`}
                        </pre>
                    </details>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button onClick={reset} variant="default">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/customers">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Customers
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
