"use client";

import { useState, useEffect } from 'react';
import { realtimeSync } from '@/lib/realtime';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function RealtimeStatus() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    useEffect(() => {
        // Simulate sync status updates
        const interval = setInterval(() => {
            const status = realtimeSync.getStatus();
            setIsSyncing(status.isActive);

            if (status.isActive) {
                setLastSync(new Date());
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!isSyncing) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <ArrowPathIcon className={`w-4 h-4 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="text-sm text-gray-600">
                        {isSyncing ? 'Syncing...' : 'Synced'}
                    </span>
                </div>
                {lastSync && (
                    <div className="text-xs text-gray-400">
                        {lastSync.toLocaleTimeString()}
                    </div>
                )}
            </div>
        </div>
    );
}
