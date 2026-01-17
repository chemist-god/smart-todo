"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AppSidebar } from "./app-sidebar"
import AuthStatus from "../auth/AuthStatus";
import SWRProvider from "../providers/SWRProvider";
import ErrorBoundary from "../ui/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { data: session, status } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

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
            <SWRProvider>
                <div className="flex min-h-screen bg-background">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50 border-r bg-card shadow-sm">
                        <AppSidebar />
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 lg:pl-72 flex flex-col min-w-0 transition-all duration-300">
                        {/* Mobile Header */}
                        <header className="lg:hidden flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sticky top-0 z-40">
                            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="shrink-0">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72">
                                    <AppSidebar />
                                </SheetContent>
                            </Sheet>
                            <div className="font-semibold text-lg">Smart Todo</div>
                        </header>

                        {/* Page Content */}
                        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                            {children}
                        </div>
                    </main>

                    <Toaster />
                </div>
            </SWRProvider>
        </ErrorBoundary>
    );
}
