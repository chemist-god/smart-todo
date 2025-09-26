"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Stake {
    id: string;
    title: string;
    description?: string;
    totalAmount: number;
    userStake: number;
    friendStakes: number;
    deadline: string;
    participantCount: number;
    totalParticipants: number;
}

interface JoinStakeModalProps {
    stake: Stake;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function JoinStakeModal({ stake, isOpen, onClose, onSuccess }: JoinStakeModalProps) {
    const [amount, setAmount] = useState(10);
    const [isSupporter, setIsSupporter] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (amount < 1) {
            addToast({ type: 'error', title: 'Error', message: 'Amount must be at least Gh1' });
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/stakes/${stake.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    isSupporter
                }),
            });

            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Successfully joined stake with Gh${amount}!`
                });
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || "Failed to join stake" });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: "An error occurred while joining the stake" });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Join Stake</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="mb-4">
                    <h3 className="font-medium text-gray-900">{stake.title}</h3>
                    {stake.description && (
                        <p className="text-sm text-gray-600 mt-1">{stake.description}</p>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                        <p>Current participants: {stake.participantCount + 1}</p>
                        <p>Deadline: {new Date(stake.deadline).toLocaleDateString()}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stake Amount (GHS)
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isSupporter"
                            checked={isSupporter}
                            onChange={(e) => setIsSupporter(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isSupporter" className="ml-2 text-sm text-gray-700">
                            I'm supporting this person
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                            Join Stake
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
