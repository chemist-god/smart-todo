"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center">
                    <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
                    <p className="mb-4 text-muted-foreground">
                        {this.state.error?.message || "An unexpected error occurred"}
                    </p>
                    <Button
                        onClick={() => this.setState({ hasError: false })}
                        variant="default"
                    >
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
