"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircleIcon, SparklesIcon, ChartBarIcon, GiftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function WelcomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const inviterName = searchParams.get("inviterName") || "your friend";
    const acceptedInvite = searchParams.get("accepted") === "true";

    useEffect(() => {
        // Redirect if not logged in
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (status === "authenticated") {
            setLoading(false);
        }
    }, [status, router]);

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const handleGetStarted = () => {
        router.push("/dashboard?onboarding=true");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-6">
                {/* Success Header */}
                {acceptedInvite && (
                    <Card className="border-success/20 bg-success/5">
                        <CardContent className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-success/20 rounded-full mb-4">
                                <CheckCircleIcon className="h-10 w-10 text-success" />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Welcome to Smart Todo! 🎉
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                You've successfully joined via {inviterName}'s invitation!
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* What's Next */}
                <Card>
                    <CardContent className="p-6 sm:p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                What's Next?
                            </h2>
                            <p className="text-muted-foreground">
                                Here's how to get the most out of Smart Todo
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            {/* Step 1 */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
                                <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                    <span className="text-primary font-bold">1</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Create Your First Task
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Start by adding tasks to your list. Use AI-powered prioritization to focus on what matters most.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
                                <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                    <span className="text-primary font-bold">2</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Set Up Your First Stake
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Stake money on your goals for accountability. Complete your goals and earn rewards!
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
                                <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                    <span className="text-primary font-bold">3</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Invite Friends
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Share your referral code and earn rewards when friends join. Build your accountability network!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <SparklesIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                                <h4 className="font-semibold text-sm text-foreground mb-1">AI-Powered</h4>
                                <p className="text-xs text-muted-foreground">Smart prioritization</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <ChartBarIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                                <h4 className="font-semibold text-sm text-foreground mb-1">Track Progress</h4>
                                <p className="text-xs text-muted-foreground">Analytics & insights</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <GiftIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                                <h4 className="font-semibold text-sm text-foreground mb-1">Earn Rewards</h4>
                                <p className="text-xs text-muted-foreground">Complete & earn</p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                            onClick={handleGetStarted}
                            size="lg"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                        >
                            Get Started
                            <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

