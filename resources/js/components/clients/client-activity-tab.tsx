import { useMemo } from 'react';
import ActivityTimeline from '@/components/clients/activity-timeline';
import { useClientStore, type ActivityChange } from '@/stores/useClientStore';
import type { Activity, ActivityData, ActivityType } from '@/types';

interface ClientActivityTabProps {
    activities: Activity[];
    clientName?: string;
}

type DisplayActivity = Activity & { isPending?: boolean };

/**
 * Generates a unique temporary ID for pending activities
 */
function generateTempId(): number {
    return Date.now() + Math.random();
}

/**
 * Merges existing activities with pending changes for optimistic UI updates
 */
function mergeActivitiesWithChanges(
    activities: Activity[],
    activityChanges: ActivityChange[],
): DisplayActivity[] {
    // Get client_id from existing activities (they should all have the same client_id)
    const clientId = activities[0]?.client_id;

    // Track IDs to be deleted
    const deletedIds = new Set(
        activityChanges
            .filter((change) => change.type === 'delete')
            .map((change) => change.activityId)
            .filter((id): id is number => id !== undefined),
    );

    // Apply updates to existing activities and filter out deleted ones
    const updatedActivities: DisplayActivity[] = activities
        .filter((activity) => !deletedIds.has(activity.id))
        .map((activity): DisplayActivity => {
            const updateChange = activityChanges.find(
                (change) =>
                    change.type === 'update' &&
                    change.activityId === activity.id,
            );

            if (updateChange?.activityData) {
                const { type, summary, data } = updateChange.activityData;
                return {
                    ...activity,
                    type: type as ActivityType,
                    summary: summary as string,
                    data: data as ActivityData,
                    isPending: true,
                };
            }

            return activity;
        });

    // Create new pending activities
    const newActivities: DisplayActivity[] = activityChanges
        .filter((change) => change.type === 'create' && change.activityData)
        .map((change) => {
            const { type, summary, data } = change.activityData!;
            return {
                id: generateTempId(),
                client_id: clientId,
                type: type as ActivityType,
                summary: summary as string,
                data: data as ActivityData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                isPending: true,
            };
        });

    // Combine with new activities at the beginning
    return [...newActivities, ...updatedActivities];
}

export default function ClientActivityTab({
    activities,
    clientName,
}: ClientActivityTabProps) {
    const activityChanges = useClientStore((state) => state.activityChanges);

    const displayActivities = useMemo(
        () => mergeActivitiesWithChanges(activities, activityChanges),
        [activities, activityChanges],
    );

    return (
        <div className="mx-auto max-w-3xl">
            <ActivityTimeline 
                activities={displayActivities} 
                clientName={clientName}
            />
        </div>
    );
}
