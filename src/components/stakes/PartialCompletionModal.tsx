"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CheckCircle, AlertTriangle, Percent } from "lucide-react";

interface PartialCompletionModalProps {
    stakeId: string;
    stakeTitle: string;
    onPartialCompletionSubmitted: () => void;
    children: React.ReactNode;
}

export function PartialCompletionModal({
    stakeId,
    stakeTitle,
    onPartialCompletionSubmitted,
    children
}: PartialCompletionModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completionPercentage, setCompletionPercentage] = useState(50);
    const [evidence, setEvidence] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/stakes/${stakeId}/partial-completion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    completionPercentage,
                    evidence: evidence || undefined
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit partial completion");
            }

            setIsOpen(false);
            setCompletionPercentage(50);
            setEvidence("");
            onPartialCompletionSubmitted();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setCompletionPercentage(50);
            setEvidence("");
            setError(null);
        }
    };

    const calculatePenaltyReduction = (percentage: number) => {
        // 50% penalty reduction for partial completion
        return Math.round(percentage * 0.5);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        Submit Partial Completion
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Stake:</strong> {stakeTitle}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Submit partial completion to reduce your penalty amount.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            <Label htmlFor="completionPercentage">
                                Completion Percentage <span className="text-red-500">*</span>
                            </Label>
                            <div className="px-3">
                                <Slider
                                    value={[completionPercentage]}
                                    onValueChange={(value) => setCompletionPercentage(value[0])}
                                    min={25}
                                    max={99}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>25%</span>
                                    <span className="font-medium">{completionPercentage}%</span>
                                    <span>99%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                                <Percent className="h-4 w-4 text-green-500" />
                                <p className="text-sm text-green-800">
                                    <strong>Penalty Reduction:</strong> {calculatePenaltyReduction(completionPercentage)}%
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="evidence">
                                Evidence (Optional)
                            </Label>
                            <Textarea
                                id="evidence"
                                placeholder="Describe what you completed or provide evidence..."
                                value={evidence}
                                onChange={(e) => setEvidence(e.target.value)}
                                className="min-h-[80px]"
                            />
                            <p className="text-xs text-gray-500">
                                Provide details about what you accomplished or links to evidence.
                            </p>
                        </div>

                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium">Important:</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Minimum 25% completion required</li>
                                        <li>Penalty will be reduced by 50% of your completion percentage</li>
                                        <li>Your streak will be partially reset instead of fully reset</li>
                                    </ul>
                                </div>
                            </div>
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
                                disabled={isSubmitting || completionPercentage < 25}
                                className="flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        Submit Partial Completion
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
