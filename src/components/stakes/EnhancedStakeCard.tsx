"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Clock,
    DollarSign,
    Users,
    AlertTriangle,
    CheckCircle,
    RotateCcw,
    FileText,
    Calendar
} from "lucide-react";
import { StakeAppealModal } from "./StakeAppealModal";
import { StakeExtensionModal } from "./StakeExtensionModal";
import { RecoveryStakeModal } from "./RecoveryStakeModal";
import { PartialCompletionModal } from "./PartialCompletionModal";

interface EnhancedStakeCardProps {
    stake: {
        id: string;
        title: string;
        description?: string;
        stakeType: string;
        status: string;
        totalAmount: number;
        userStake: number;
        deadline: string;
        gracePeriodEnd?: string;
        completionPercentage?: number;
        isExtended: boolean;
        extensionCount: number;
        isOverdue: boolean;
        timeRemaining: number;
        progress: number;
        participantCount: number;
        isOwner: boolean;
    };
    onStakeUpdated: () => void;
}

export function EnhancedStakeCard({ stake, onStakeUpdated }: EnhancedStakeCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    const formatTimeRemaining = (timeRemaining: number) => {
        if (timeRemaining <= 0) return "Overdue";

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getStatusBadge = () => {
        switch (stake.status) {
            case 'ACTIVE':
                return <Badge variant="default">Active</Badge>;
            case 'GRACE_PERIOD':
                return <Badge variant="secondary">Grace Period</Badge>;
            case 'COMPLETED':
                return <Badge variant="default" className="bg-green-500">Completed</Badge>;
            case 'FAILED':
                return <Badge variant="destructive">Failed</Badge>;
            case 'PARTIALLY_COMPLETED':
                return <Badge variant="secondary" className="bg-blue-500">Partial</Badge>;
            case 'DISPUTED':
                return <Badge variant="outline" className="border-amber-500 text-amber-600">Disputed</Badge>;
            default:
                return <Badge variant="outline">{stake.status}</Badge>;
        }
    };

    const getStakeTypeIcon = () => {
        switch (stake.stakeType) {
            case 'SELF_STAKE':
                return <DollarSign className="h-4 w-4" />;
            case 'SOCIAL_STAKE':
                return <Users className="h-4 w-4" />;
            case 'CHALLENGE_STAKE':
                return <CheckCircle className="h-4 w-4" />;
            case 'TEAM_STAKE':
                return <Users className="h-4 w-4" />;
            case 'CHARITY_STAKE':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <DollarSign className="h-4 w-4" />;
        }
    };

    const canRequestExtension = () => {
        return stake.isOwner &&
            (stake.status === 'ACTIVE' || stake.status === 'GRACE_PERIOD') &&
            stake.extensionCount < 3;
    };

    const canSubmitAppeal = () => {
        return stake.isOwner && stake.status === 'FAILED';
    };

    const canCreateRecovery = () => {
        return stake.isOwner && stake.status === 'FAILED';
    };

    const canSubmitPartialCompletion = () => {
        return stake.isOwner &&
            (stake.status === 'ACTIVE' || stake.status === 'GRACE_PERIOD') &&
            stake.isOverdue;
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {getStakeTypeIcon()}
                        <CardTitle className="text-lg">{stake.title}</CardTitle>
                    </div>
                    {getStatusBadge()}
                </div>
                {stake.description && (
                    <p className="text-sm text-gray-600 mt-1">{stake.description}</p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Stake Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>${stake.userStake.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{formatTimeRemaining(stake.timeRemaining)}</span>
                    </div>
                    {stake.participantCount > 0 && (
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{stake.participantCount} participants</span>
                        </div>
                    )}
                    {stake.isExtended && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Extended ({stake.extensionCount}x)</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {stake.status === 'ACTIVE' || stake.status === 'GRACE_PERIOD' ? (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{stake.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${stake.progress}%` }}
                            />
                        </div>
                    </div>
                ) : null}

                {/* Grace Period Warning */}
                {stake.status === 'GRACE_PERIOD' && stake.gracePeriodEnd && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <p className="text-sm text-amber-800">
                                Grace period active. Complete your stake before the grace period ends.
                            </p>
                        </div>
                    </div>
                )}

                {/* Partial Completion Info */}
                {stake.status === 'PARTIALLY_COMPLETED' && stake.completionPercentage && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <p className="text-sm text-blue-800">
                                Partially completed ({stake.completionPercentage}%) - Penalty reduced
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {stake.isOwner && (
                    <div className="flex flex-wrap gap-2">
                        {canRequestExtension() && (
                            <StakeExtensionModal
                                stakeId={stake.id}
                                stakeTitle={stake.title}
                                currentDeadline={new Date(stake.deadline)}
                                onExtensionRequested={onStakeUpdated}
                            >
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Extend
                                </Button>
                            </StakeExtensionModal>
                        )}

                        {canSubmitPartialCompletion() && (
                            <PartialCompletionModal
                                stakeId={stake.id}
                                stakeTitle={stake.title}
                                onPartialCompletionSubmitted={onStakeUpdated}
                            >
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Partial Complete
                                </Button>
                            </PartialCompletionModal>
                        )}

                        {canSubmitAppeal() && (
                            <StakeAppealModal
                                stakeId={stake.id}
                                stakeTitle={stake.title}
                                onAppealSubmitted={onStakeUpdated}
                            >
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Appeal
                                </Button>
                            </StakeAppealModal>
                        )}

                        {canCreateRecovery() && (
                            <RecoveryStakeModal
                                originalStakeId={stake.id}
                                originalStakeTitle={stake.title}
                                onRecoveryStakeCreated={onStakeUpdated}
                            >
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Recovery
                                </Button>
                            </RecoveryStakeModal>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
