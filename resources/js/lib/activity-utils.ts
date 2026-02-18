import {
    isToday,
    isYesterday,
    isThisWeek,
    isThisMonth,
    parseISO,
} from 'date-fns';
import type { Activity, ActivityType } from '@/types';

export type DateGroup =
    | 'today'
    | 'yesterday'
    | 'this-week'
    | 'this-month'
    | 'older';

export interface GroupedActivities {
    group: DateGroup;
    label: string;
    activities: Activity[];
}

/**
 * Determines which date group an activity belongs to
 */
export function getDateGroup(dateString: string): DateGroup {
    const date = parseISO(dateString);

    if (isToday(date)) return 'today';
    if (isYesterday(date)) return 'yesterday';
    if (isThisWeek(date, { weekStartsOn: 0 })) return 'this-week';
    if (isThisMonth(date)) return 'this-month';
    return 'older';
}

/**
 * Gets the human-readable label for a date group
 */
export function getDateGroupLabel(group: DateGroup): string {
    const labels: Record<DateGroup, string> = {
        today: 'Today',
        yesterday: 'Yesterday',
        'this-week': 'This Week',
        'this-month': 'This Month',
        older: 'Older',
    };
    return labels[group];
}

/**
 * Gets the order index for a date group (for sorting)
 */
function getDateGroupOrder(group: DateGroup): number {
    const order: Record<DateGroup, number> = {
        today: 0,
        yesterday: 1,
        'this-week': 2,
        'this-month': 3,
        older: 4,
    };
    return order[group];
}

/**
 * Sorts activities by date in reverse chronological order (newest first)
 */
export function sortActivitiesByDate(activities: Activity[]): Activity[] {
    return [...activities].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Newest first
    });
}

/**
 * Groups activities by date categories
 */
export function groupActivitiesByDate(
    activities: Activity[],
): GroupedActivities[] {
    // First, sort activities by date
    const sorted = sortActivitiesByDate(activities);

    // Group by date category
    const groups = new Map<DateGroup, Activity[]>();

    sorted.forEach((activity) => {
        const group = getDateGroup(activity.created_at);
        if (!groups.has(group)) {
            groups.set(group, []);
        }
        groups.get(group)!.push(activity);
    });

    // Convert to array and sort by group order
    return Array.from(groups.entries())
        .map(([group, activities]) => ({
            group,
            label: getDateGroupLabel(group),
            activities,
        }))
        .sort(
            (a, b) => getDateGroupOrder(a.group) - getDateGroupOrder(b.group),
        );
}

/**
 * Filters activities by selected types
 */
export function filterActivitiesByType(
    activities: Activity[],
    selectedTypes: Set<ActivityType>,
): Activity[] {
    if (selectedTypes.size === 0) {
        return activities; // No filter applied, return all
    }
    return activities.filter((activity) => selectedTypes.has(activity.type));
}

/**
 * Searches activities by query string (case-insensitive)
 * Searches in: summary, notes, and other data fields
 */
export function searchActivities(
    activities: Activity[],
    query: string,
): Activity[] {
    if (!query.trim()) {
        return activities;
    }

    const lowerQuery = query.toLowerCase().trim();

    return activities.filter((activity) => {
        // Search in summary
        if (activity.summary?.toLowerCase().includes(lowerQuery)) {
            return true;
        }

        // Search in notes
        if (activity.data?.notes?.toLowerCase().includes(lowerQuery)) {
            return true;
        }

        // Search in other data fields
        const dataString = JSON.stringify(activity.data).toLowerCase();
        if (dataString.includes(lowerQuery)) {
            return true;
        }

        // Search in user name
        if (activity.user?.name.toLowerCase().includes(lowerQuery)) {
            return true;
        }

        return false;
    });
}

/**
 * Gets the default expanded activity IDs (e.g., activities from today)
 */
export function getDefaultExpandedIds(activities: Activity[]): Set<number> {
    const expandedIds = new Set<number>();

    activities.forEach((activity) => {
        const group = getDateGroup(activity.created_at);
        if (group === 'today') {
            expandedIds.add(activity.id);
        }
    });

    return expandedIds;
}

/**
 * Applies all filters and search to activities, then groups them
 */
export function processActivities(
    activities: Activity[],
    selectedTypes: Set<ActivityType>,
    searchQuery: string,
): GroupedActivities[] {
    // Apply filters
    let filtered = filterActivitiesByType(activities, selectedTypes);

    // Apply search
    filtered = searchActivities(filtered, searchQuery);

    // Group by date
    return groupActivitiesByDate(filtered);
}
