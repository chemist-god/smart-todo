"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import AuthStatus from "../auth/AuthStatus";
import SWRProvider from "../providers/SWRProvider";
import ErrorBoundary from "../ui/ErrorBoundary";
import { ToastProvider } from "../ui/Toast";
import LoadingSpinner from "../ui/LoadingSpinner";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="xl" />
                    <div className="space-y-2">
                        <p className="text-lg font-semibold text-foreground">Loading Smart Todo</p>
                        <p className="text-sm text-muted-foreground">Preparing your productivity workspace...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-2xl">📝</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Smart Todo</h1>
                            <p className="text-muted-foreground mt-2">Your Personal Productivity Ecosystem</p>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl shadow-soft p-6">
                        <AuthStatus />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <ToastProvider>
                <SWRProvider>
                    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/10">
                        <Sidebar />
                        <main className="flex-1 overflow-auto">
                            <div className="p-4 sm:p-6 lg:p-8 lg:pl-4">
                                {children}
                            </div>
                        </main>
                    </div>
                </SWRProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
}
