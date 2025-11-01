"use client";

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ExportButtonProps {
    period?: string;
}

export default function ExportButton({ period = '30' }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            setIsExporting(true);
            const response = await fetch(`/api/analytics/export?format=${format}&period=${period}`);

            if (!response.ok) {
                throw new Error('Export failed');
            }

            if (format === 'csv') {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `smart-todo-analytics-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const data = await response.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `smart-todo-analytics-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-2xl hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export JSON'}
            </button>
        </div>
    );
}
