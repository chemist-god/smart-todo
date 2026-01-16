"use client";

import { useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function InvitationTest() {
    const [stakeId, setStakeId] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [invitationId, setInvitationId] = useState("");
    const [loading, setLoading] = useState(false);
    // const { addToast } = useToast();

    const createInvitation = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stakeId.trim() || !email.trim()) {
            toast.error('Error', { description: 'Please fill in all fields' });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/stakes/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stakeId: stakeId.trim(),
                    email: email.trim(),
                    message: message.trim() || undefined
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setInvitationId(data.invitationId);
                toast.success('Invitation Created!', {
                    description: `Invitation ID: ${data.invitationId}`
                });
            } else {
                toast.error('Error', {
                    description: data.error || 'Failed to create invitation'
                });
            }
        } catch (error) {
            toast.error('Error', {
                description: 'An error occurred while creating invitation'
            });
        } finally {
            setLoading(false);
        }
    };

    const testInvitation = async () => {
        if (!invitationId.trim()) {
            toast.error('Error', { description: 'Please create an invitation first' });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/stakes/invitation/${invitationId}`);
            const data = await response.json();

            if (response.ok) {
                toast.success('Invitation Found!', {
                    description: `Stake: ${data.invitation.stakeTitle}`
                });
            } else {
                toast.error('Error', {
                    description: data.error || 'Failed to fetch invitation'
                });
            }
        } catch (error) {
            toast.error('Error', {
                description: 'An error occurred while testing invitation'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Invitation Test</h2>

            <form onSubmit={createInvitation} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stake ID
                    </label>
                    <input
                        type="text"
                        value={stakeId}
                        onChange={(e) => setStakeId(e.target.value)}
                        placeholder="Enter stake ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message (Optional)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter custom message"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {loading && <LoadingSpinner size="sm" />}
                    Create Invitation
                </button>
            </form>

            {invitationId && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Invitation Created:</h3>
                    <p className="text-sm text-gray-600 mb-2">ID: {invitationId}</p>
                    <p className="text-sm text-gray-600 mb-3">
                        Test URL: <code className="bg-gray-200 px-1 rounded">/stakes/invite/{invitationId}</code>
                    </p>
                    <button
                        onClick={testInvitation}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loading && <LoadingSpinner size="sm" />}
                        Test Invitation
                    </button>
                </div>
            )}
        </div>
    );
}
