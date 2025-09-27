import { NextRequest, NextResponse } from "next/server";
import { PenaltyService } from "@/lib/penalty-service";

export async function POST(request: NextRequest) {
    try {
        // Verify this is a legitimate cron request (you can add authentication here)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Process overdue stakes
        const result = await PenaltyService.processOverdueStakes();

        return NextResponse.json({
            success: true,
            message: `Processed ${result.processed} overdue stakes`,
            processed: result.processed,
            failures: result.failures
        });

    } catch (error) {
        console.error('Error in cron job:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Allow GET for manual testing
export async function GET() {
    try {
        const result = await PenaltyService.processOverdueStakes();

        return NextResponse.json({
            success: true,
            message: `Processed ${result.processed} overdue stakes`,
            processed: result.processed,
            failures: result.failures
        });
    } catch (error) {
        console.error('Error processing overdue stakes:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
