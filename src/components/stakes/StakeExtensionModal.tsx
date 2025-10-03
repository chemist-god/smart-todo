"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, DollarSign, Calendar, AlertTriangle } from "lucide-react";

interface StakeExtensionModalProps {
    stakeId: string;
    stakeTitle: string;
    currentDeadline: Date;
    onExtensionRequested: () => void;
    children: React.ReactNode;
}

interface EligibilityData {
    eligible: boolean;
    reason?: string;
    nextExtensionFee?: number;
}

export function StakeExtensionModal({
    stakeId,
    stakeTitle,
    currentDeadline,
    onExtensionRequested,
    children
}: StakeExtensionModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
    const [formData, setFormData] = useState({
        newDeadline: "",
        reason: ""
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            checkEligibility();
        }
    }, [isOpen, stakeId]);

    const checkEligibility = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/extensions/eligibility/${stakeId}`);
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
            const response = await fetch("/api/extensions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stakeId,
                    newDeadline: formData.newDeadline,
                    reason: formData.reason || undefined
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to request extension");
            }

            setIsOpen(false);
            setFormData({ newDeadline: "", reason: "" });
            onExtensionRequested();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setFormData({ newDeadline: "", reason: "" });
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

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 7); // Maximum 7 days extension
        return formatDate(maxDate);
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
                        <Clock className="h-5 w-5 text-blue-500" />
                        Request Deadline Extension
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Stake:</strong> {stakeTitle}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            <strong>Current Deadline:</strong> {currentDeadline.toLocaleString()}
                        </p>
                    </div>

                    {eligibility && !eligibility.eligible ? (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <p className="text-sm text-red-800">
                                    {eligibility.reason}
                                </p>
                            </div>
                            {eligibility.nextExtensionFee && (
                                <p className="text-xs text-red-600 mt-1">
                                    Required fee: ${eligibility.nextExtensionFee}
                                </p>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {eligibility?.nextExtensionFee && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-amber-500" />
                                        <p className="text-sm text-amber-800">
                                            Extension Fee: <strong>${eligibility.nextExtensionFee}</strong>
                                        </p>
                                    </div>
                                    <p className="text-xs text-amber-600 mt-1">
                                        This fee will be deducted from your wallet balance.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="newDeadline">
                                    New Deadline <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="newDeadline"
                                    type="datetime-local"
                                    value={formData.newDeadline}
                                    onChange={(e) => setFormData(prev => ({ ...prev, newDeadline: e.target.value }))}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    Maximum extension: 7 days from today
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">
                                    Reason for Extension (Optional)
                                </Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Explain why you need an extension..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                    className="min-h-[80px]"
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
                                    disabled={isSubmitting || !formData.newDeadline}
                                    className="flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Requesting...
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="h-4 w-4" />
                                            Request Extension
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
