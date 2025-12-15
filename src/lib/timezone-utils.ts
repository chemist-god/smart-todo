/**
 * Timezone utility functions for consistent deadline handling
 * All deadlines are stored in UTC in the database
 * Frontend converts to/from user's local timezone for display
 */

/**
 * Convert a datetime-local string (from HTML input) to UTC Date
 * Handles timezone conversion properly
 * 
 * @param datetimeLocalString - String from datetime-local input (e.g., "2024-01-15T14:30")
 * @returns Date object in UTC
 */
export function parseDeadlineToUTC(datetimeLocalString: string): Date {
    if (!datetimeLocalString) {
        throw new Error("Deadline string is required");
    }

    // datetime-local input provides date/time in user's local timezone
    // We need to parse it as local time, then convert to UTC
    // Create date from the string (interpreted as local time)
    const localDate = new Date(datetimeLocalString);

    // Validate the date is valid
    if (isNaN(localDate.getTime())) {
        throw new Error(`Invalid deadline format: ${datetimeLocalString}`);
    }

    // The Date object is already in UTC internally, but we want to ensure
    // we're working with the correct time. The string is interpreted as local time,
    // so the Date object correctly represents that moment in UTC
    return localDate;
}

/**
 * Convert a UTC Date to datetime-local string format for HTML input
 * Converts from UTC to user's local timezone
 * 
 * @param utcDate - Date object in UTC
 * @returns String in datetime-local format (e.g., "2024-01-15T14:30")
 */
export function formatDeadlineFromUTC(utcDate: Date): string {
    if (!utcDate || isNaN(utcDate.getTime())) {
        throw new Error("Valid UTC date is required");
    }

    // Get local time components
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getDate()).padStart(2, '0');
    const hours = String(utcDate.getHours()).padStart(2, '0');
    const minutes = String(utcDate.getMinutes()).padStart(2, '0');

    // Format as datetime-local (YYYY-MM-DDTHH:mm)
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Validate deadline is within acceptable range
 * 
 * @param deadline - Date object to validate
 * @param minHoursFromNow - Minimum hours from now (default: 24)
 * @param maxDaysFromNow - Maximum days from now (default: 30)
 * @returns Object with isValid flag and error message if invalid
 */
export function validateDeadlineRange(
    deadline: Date,
    minHoursFromNow: number = 24,
    maxDaysFromNow: number = 30
): { isValid: boolean; error?: string } {
    const now = new Date();
    const minDeadline = new Date(now.getTime() + minHoursFromNow * 60 * 60 * 1000);
    const maxDeadline = new Date(now.getTime() + maxDaysFromNow * 24 * 60 * 60 * 1000);

    if (deadline < minDeadline) {
        return {
            isValid: false,
            error: `Deadline must be at least ${minHoursFromNow} hours from now`
        };
    }

    if (deadline > maxDeadline) {
        return {
            isValid: false,
            error: `Deadline cannot be more than ${maxDaysFromNow} days from now`
        };
    }

    return { isValid: true };
}

/**
 * Get minimum deadline datetime-local string for HTML input
 * 
 * @param minHoursFromNow - Minimum hours from now (default: 24)
 * @returns String in datetime-local format
 */
export function getMinDeadlineString(minHoursFromNow: number = 24): string {
    const minDeadline = new Date(Date.now() + minHoursFromNow * 60 * 60 * 1000);
    return formatDeadlineFromUTC(minDeadline);
}

/**
 * Get maximum deadline datetime-local string for HTML input
 * 
 * @param maxDaysFromNow - Maximum days from now (default: 30)
 * @returns String in datetime-local format
 */
export function getMaxDeadlineString(maxDaysFromNow: number = 30): string {
    const maxDeadline = new Date(Date.now() + maxDaysFromNow * 24 * 60 * 60 * 1000);
    return formatDeadlineFromUTC(maxDeadline);
}

/**
 * Convert a date-only string (from todo dueDate) to a proper deadline
 * Sets time to end of day (23:59:59) in user's local timezone
 * 
 * @param dateString - Date string (YYYY-MM-DD format)
 * @returns Date object representing end of day in UTC
 */
export function convertDateToDeadline(dateString: string): Date {
    if (!dateString) {
        throw new Error("Date string is required");
    }

    // Parse the date string (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);

    if (!year || !month || !day) {
        throw new Error(`Invalid date format: ${dateString}`);
    }

    // Create date at end of day in local timezone
    // This will be automatically converted to UTC by the Date constructor
    const localDate = new Date(year, month - 1, day, 23, 59, 59);

    return localDate;
}

