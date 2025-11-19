"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Clock,
    FileText,
    ChevronDown,
    ChevronUp,
    Zap,
    Shield
} from "lucide-react";
import { StructuredPartialProgressFlow } from "./StructuredPartialProgressFlow";
import { StructuredAppealFlow } from "./StructuredAppealFlow";

interface OverdueStakeActionsProps {
    stake: {
        id: string;
        title: string;
        stakeType: string;
        totalAmount: number;
        userStake: number;
        deadline: string;
        isOverdue: boolean;
        timeRemaining: number;
        isOwner: boolean;
        extensionCount?: number;
        isExtended?: boolean;
    };
    onStakeUpdated: () => void;
}

export function OverdueStakeActions({ stake, onStakeUpdated }: OverdueStakeActionsProps) {
    const [showExtendedActions, setShowExtendedActions] = useState(false);

    const formatCurrency = (amount: number) => `₵${amount.toFixed(2)}`;

    const getOverdueDuration = () => {
        const overdueMs = Math.abs(stake.timeRemaining);
        const hours = Math.floor(overdueMs / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h overdue`;
        if (hours > 0) return `${hours}h overdue`;
        return "Just overdue";
    };

    const getUrgencyLevel = () => {
        const overdueMs = Math.abs(stake.timeRemaining);
        const hours = Math.floor(overdueMs / (1000 * 60 * 60));

        if (hours < 2) return "critical";
        if (hours < 24) return "high";
        if (hours < 72) return "medium";
        return "low";
    };

    const urgencyLevel = getUrgencyLevel();

    const getUrgencyStyles = () => {
        switch (urgencyLevel) {
            case "critical":
                return {
                    container: "border-red-200 bg-red-50/50",
                    badge: "bg-red-100 text-red-800 border-red-200",
                    primaryButton: "bg-red-600 hover:bg-red-700 text-white",
                    icon: "text-red-600"
                };
            case "high":
                return {
                    container: "border-orange-200 bg-orange-50/50",
                    badge: "bg-orange-100 text-orange-800 border-orange-200",
                    primaryButton: "bg-orange-600 hover:bg-orange-700 text-white",
                    icon: "text-orange-600"
                };
            case "medium":
                return {
                    container: "border-amber-200 bg-amber-50/50",
                    badge: "bg-amber-100 text-amber-800 border-amber-200",
                    primaryButton: "bg-amber-600 hover:bg-amber-600 text-white",
                    icon: "text-amber-600"
                };
            default:
                return {
                    container: "border-gray-200 bg-gray-50/50",
                    badge: "bg-gray-100 text-gray-800 border-gray-200",
                    primaryButton: "bg-gray-600 hover:bg-gray-700 text-white",
                    icon: "text-gray-600"
                };
        }
    };

    const styles = getUrgencyStyles();

    const getPrimaryAction = () => {
        // Different primary actions based on stake type and overdue duration
        if (stake.stakeType === 'SOCIAL_STAKE' && urgencyLevel === "critical") {
            return {
                label: "Request Extension",
                icon: <Clock className="w-4 h-4" />,
                description: "Get more time to complete"
            };
        }

        if (urgencyLevel === "high" || urgencyLevel === "critical") {
            return {
                label: "Submit Partial Progress",
                icon: <FileText className="w-4 h-4" />,
                description: "Show what you've accomplished"
            };
        }

        return {
            label: "Appeal Penalty",
            icon: <Shield className="w-4 h-4" />,
            description: "Challenge the penalty"
        };
    };

    const primaryAction = getPrimaryAction();

    const handlePrimaryAction = () => {
        // The primary action will be handled by the structured flow components
        // This function is kept for consistency but the actual actions are in the buttons
    };

    return (
        <div className={`border-2 rounded-lg ${styles.container} transition-all duration-300`}>
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
                        <Badge variant="outline" className={styles.badge}>
                            Overdue
                        </Badge>
                    </div>
                    <div className="text-right">
                        <div className={`text-sm font-medium ${styles.icon}`}>
                            {getOverdueDuration()}
                        </div>
                        <div className="text-xs text-gray-500">
                            Penalty: {formatCurrency(stake.totalAmount)}
                        </div>
                    </div>
                </div>

                {/* Primary Action */}
                <div className="space-y-3">
                    {stake.stakeType === 'SOCIAL_STAKE' && urgencyLevel === "critical" ? (
                        <StructuredAppealFlow
                            stakeId={stake.id}
                            stakeTitle={stake.title}
                            stakeDeadline={stake.deadline}
                            totalAmount={stake.totalAmount}
                            onAppealSubmitted={onStakeUpdated}
                        >
                            <Button
                                className={`w-full ${styles.primaryButton} h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                            >
                                <div className="flex items-center gap-2">
                                    {primaryAction.icon}
                                    {primaryAction.label}
                                </div>
                            </Button>
                        </StructuredAppealFlow>
                    ) : urgencyLevel === "high" || urgencyLevel === "critical" ? (
                        <StructuredPartialProgressFlow
                            stakeId={stake.id}
                            stakeTitle={stake.title}
                            stakeDeadline={stake.deadline}
                            totalAmount={stake.totalAmount}
                            onPartialCompletionSubmitted={onStakeUpdated}
                        >
                            <Button
                                className={`w-full ${styles.primaryButton} h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                            >
                                <div className="flex items-center gap-2">
                                    {primaryAction.icon}
                                    {primaryAction.label}
                                </div>
                            </Button>
                        </StructuredPartialProgressFlow>
                    ) : (
                        <StructuredAppealFlow
                            stakeId={stake.id}
                            stakeTitle={stake.title}
                            stakeDeadline={stake.deadline}
                            totalAmount={stake.totalAmount}
                            onAppealSubmitted={onStakeUpdated}
                        >
                            <Button
                                className={`w-full ${styles.primaryButton} h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                            >
                                <div className="flex items-center gap-2">
                                    {primaryAction.icon}
                                    {primaryAction.label}
                                </div>
                            </Button>
                        </StructuredAppealFlow>
                    )}

                    <p className="text-sm text-gray-600 text-center">
                        {primaryAction.description}
                    </p>
                </div>

                {/* Extended Actions Toggle */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExtendedActions(!showExtendedActions)}
                        className="w-full text-gray-600 hover:text-gray-800"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">More Options</span>
                            {showExtendedActions ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </div>
                    </Button>

                    {/* Extended Actions */}
                    {showExtendedActions && (
                        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                            {stake.stakeType === 'SOCIAL_STAKE' && (
                                <StructuredAppealFlow
                                    stakeId={stake.id}
                                    stakeTitle={stake.title}
                                    stakeDeadline={stake.deadline}
                                    totalAmount={stake.totalAmount}
                                    onAppealSubmitted={onStakeUpdated}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-gray-700 hover:bg-orange-50 hover:border-orange-200"
                                    >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Request Extension
                                    </Button>
                                </StructuredAppealFlow>
                            )}

                            <StructuredPartialProgressFlow
                                stakeId={stake.id}
                                stakeTitle={stake.title}
                                stakeDeadline={stake.deadline}
                                totalAmount={stake.totalAmount}
                                onPartialCompletionSubmitted={onStakeUpdated}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:border-blue-200"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Submit Partial Progress
                                </Button>
                            </StructuredPartialProgressFlow>

                            <StructuredAppealFlow
                                stakeId={stake.id}
                                stakeTitle={stake.title}
                                stakeDeadline={stake.deadline}
                                totalAmount={stake.totalAmount}
                                onAppealSubmitted={onStakeUpdated}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:border-purple-200"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Appeal Penalty
                                </Button>
                            </StructuredAppealFlow>
                        </div>
                    )}
                </div>

                {/* Recovery Tips */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <div className="font-medium text-blue-800 mb-1">
                                Recovery Tips
                            </div>
                            <ul className="text-blue-700 space-y-1 text-xs">
                                <li>• Submit partial progress to reduce penalty</li>
                                <li>• Request extension if you have a valid reason</li>
                                <li>• Appeal if you believe the penalty is unfair</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}