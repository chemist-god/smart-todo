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
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong!
                        </h1>

                        <p className="text-gray-600 mb-6">
                            We're sorry, but something unexpected happened. Please try again.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                                    Error Details (Development)
                                </summary>
                                <pre className="text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto">
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

