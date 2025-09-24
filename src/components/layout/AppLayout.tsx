"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import AuthStatus from "../auth/AuthStatus";
import SWRProvider from "../providers/SWRProvider";
import RealtimeStatus from "../ui/RealtimeStatus";
import ErrorBoundary from "../ui/ErrorBoundary";
import { ToastProvider } from "../ui/Toast";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading your Smart Todo...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-md w-full space-y-8 p-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Todo</h1>
                        <p className="text-gray-600 mb-8">Your Personal Productivity Ecosystem</p>
                    </div>
                    <AuthStatus />
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <ToastProvider>
                <SWRProvider>
                    <div className="flex h-screen bg-gray-50">
                        <Sidebar />
                        <main className="flex-1 overflow-auto">
                            <div className="p-6">
                                {children}
                            </div>
                        </main>
                        <RealtimeStatus />
                    </div>
                </SWRProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
}
