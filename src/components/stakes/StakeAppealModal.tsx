"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileText, Send } from "lucide-react";

interface StakeAppealModalProps {
    stakeId: string;
    stakeTitle: string;
    onAppealSubmitted: () => void;
    children: React.ReactNode;
}

export function StakeAppealModal({ stakeId, stakeTitle, onAppealSubmitted, children }: StakeAppealModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        reason: "",
        evidence: ""
    });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/appeals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stakeId,
                    reason: formData.reason,
                    evidence: formData.evidence || undefined
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit appeal");
            }

            setIsOpen(false);
            setFormData({ reason: "", evidence: "" });
            onAppealSubmitted();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setFormData({ reason: "", evidence: "" });
            setError(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        Appeal Failed Stake
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                            <strong>Stake:</strong> {stakeTitle}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                            Provide a valid reason and evidence for why this stake should be reconsidered.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                Reason for Appeal <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain why this stake should be reconsidered..."
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                className="min-h-[100px]"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                {formData.reason.length}/500 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="evidence">
                                Evidence (Optional)
                            </Label>
                            <Input
                                id="evidence"
                                placeholder="Link to evidence or description..."
                                value={formData.evidence}
                                onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
                            />
                            <p className="text-xs text-gray-500">
                                Provide links to screenshots, documents, or other evidence supporting your appeal.
                            </p>
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
                                disabled={isSubmitting || formData.reason.length < 10}
                                className="flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Submit Appeal
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
