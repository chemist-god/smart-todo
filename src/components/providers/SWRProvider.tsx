"use client";

import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr-config';
import { realtimeSync } from '@/lib/realtime';
import { useEffect } from 'react';

interface SWRProviderProps {
    children: React.ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
    useEffect(() => {
        // Start real-time sync when the provider mounts
        realtimeSync.start();

        // Cleanup when the provider unmounts
        return () => {
            realtimeSync.stop();
        };
    }, []);

    return (
        <SWRConfig value={swrConfig}>
            {children}
        </SWRConfig>
    );
}
