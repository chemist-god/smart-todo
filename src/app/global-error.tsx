'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-muted/20">
                    <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 text-center border border-border">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-4">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>

                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Something went wrong!
                        </h1>

                        <p className="text-muted-foreground mb-6">
                            We&apos;re sorry, but something unexpected happened. Please try again.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                                    Error Details (Development)
                                </summary>
                                <pre className="text-xs text-destructive bg-destructive/5 p-3 rounded overflow-auto">
                                    {error.message}
                                    {error.stack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={reset}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try again
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                            >
                                Go home
                            </Button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}

