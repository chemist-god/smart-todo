"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, DollarSign, Target, AlertTriangle } from "lucide-react";

interface RecoveryStakeModalProps {
    originalStakeId: string;
    originalStakeTitle: string;
    onRecoveryStakeCreated: () => void;
    children: React.ReactNode;
}

interface EligibilityData {
    eligible: boolean;
    reason?: string;
    maxRecoveryAmount?: number;
    existingRecoveryStakes?: number;
}

export function RecoveryStakeModal({
    originalStakeId,
    originalStakeTitle,
    onRecoveryStakeCreated,
    children
}: RecoveryStakeModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        stakeType: "SELF_STAKE" as const,
        userStake: "",
        deadline: ""
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            checkEligibility();
        }
    }, [isOpen, originalStakeId]);

    const checkEligibility = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/recovery-stakes/eligibility/${originalStakeId}`);
            const data = await response.json();
            setEligibility(data);
        } catch (err) {
            setError("Failed to check eligibility");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/recovery-stakes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    originalStakeId,
                    title: formData.title,
                    description: formData.description || undefined,
                    stakeType: formData.stakeType,
                    userStake: parseFloat(formData.userStake),
                    deadline: formData.deadline
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create recovery stake");
            }

            setIsOpen(false);
            setFormData({
                title: "",
                description: "",
                stakeType: "SELF_STAKE",
                userStake: "",
                deadline: ""
            });
            onRecoveryStakeCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setFormData({
                title: "",
                description: "",
                stakeType: "SELF_STAKE",
                userStake: "",
                deadline: ""
            });
            setError(null);
            setEligibility(null);
        }
    };

    const formatDate = (date: Date) => {
        return date.toISOString().slice(0, 16);
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return formatDate(tomorrow);
    };

    const calculateRecoveryTarget = (stakeAmount: number) => {
        if (!eligibility?.maxRecoveryAmount) return 0;
        return Math.min(eligibility.maxRecoveryAmount, stakeAmount * 1.5); // 1.5x multiplier
    };

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <div className="flex items-center justify-center p-8">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-green-500" />
                        Create Recovery Stake
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            <strong>Original Stake:</strong> {originalStakeTitle}
                        </p>
                        {eligibility?.maxRecoveryAmount && (
                            <p className="text-xs text-green-600 mt-1">
                                <strong>Max Recovery:</strong> ${eligibility.maxRecoveryAmount.toFixed(2)}
                            </p>
                        )}
                    </div>

                    {eligibility && !eligibility.eligible ? (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <p className="text-sm text-red-800">
                                    {eligibility.reason}
                                </p>
                            </div>
                            {eligibility.existingRecoveryStakes !== undefined && (
                                <p className="text-xs text-red-600 mt-1">
                                    Existing recovery stakes: {eligibility.existingRecoveryStakes}
                                </p>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Recovery Stake Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Enter a title for your recovery stake..."
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe what you'll do to earn back your lost money..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stakeType">
                                    Stake Type <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.stakeType}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, stakeType: value as any }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SELF_STAKE">Self Stake</SelectItem>
                                        <SelectItem value="SOCIAL_STAKE">Social Stake</SelectItem>
                                        <SelectItem value="CHALLENGE_STAKE">Challenge Stake</SelectItem>
                                        <SelectItem value="TEAM_STAKE">Team Stake</SelectItem>
                                        <SelectItem value="CHARITY_STAKE">Charity Stake</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="userStake">
                                    Stake Amount <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="userStake"
                                    type="number"
                                    min="5"
                                    step="0.01"
                                    placeholder="5.00"
                                    value={formData.userStake}
                                    onChange={(e) => setFormData(prev => ({ ...prev, userStake: e.target.value }))}
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    Minimum: $5.00
                                </p>
                                {formData.userStake && eligibility?.maxRecoveryAmount && (
                                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-3 w-3 text-blue-500" />
                                            <p className="text-xs text-blue-800">
                                                <strong>Recovery Target:</strong> ${calculateRecoveryTarget(parseFloat(formData.userStake)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deadline">
                                    Deadline <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="deadline"
                                    type="datetime-local"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                                    min={getMinDate()}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !formData.title || !formData.userStake || !formData.deadline}
                                    className="flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="h-4 w-4" />
                                            Create Recovery Stake
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
