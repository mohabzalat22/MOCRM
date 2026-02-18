import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import ActivityTimeline from '@/components/clients/activity-timeline';
import { useClientStore, type ActivityChange } from '@/stores/useClientStore';
import type {
    Activity,
    ActivityData,
    ActivityType,
    Client,
    SharedData,
} from '@/types';

interface ClientActivityTabProps {
    activities: Activity[];
    client: Client;
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
    clientId: number,
    userId: number,
): DisplayActivity[] {
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
                const { type, summary, data, occurred_at } =
                    updateChange.activityData;
                return {
                    ...activity,
                    type: type as ActivityType,
                    summary: summary as string,
                    data: data as ActivityData,
                    occurred_at: occurred_at || activity.occurred_at,
                    isPending: true,
                };
            }

            return activity;
        });

    // Create new pending activities
    const newActivities: DisplayActivity[] = activityChanges
        .filter((change) => change.type === 'create' && change.activityData)
        .map((change) => {
            const { type, summary, data, occurred_at } = change.activityData!;
            return {
                id: generateTempId(),
                client_id: clientId,
                user_id: userId,
                type: type as ActivityType,
                summary: (summary as string) || '',
                data: (data as ActivityData) || {},
                occurred_at: occurred_at || new Date().toISOString(),
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
    client,
}: ClientActivityTabProps) {
    const activityChanges = useClientStore((state) => state.activityChanges);

    const { auth } = usePage<SharedData>().props;
    const userId = auth.user.id;

    const displayActivities = useMemo(
        () =>
            mergeActivitiesWithChanges(
                activities,
                activityChanges,
                Number(client.id),
                userId,
            ),
        [activities, activityChanges, client.id, userId],
    );

    return (
        <div className="mx-auto max-w-3xl">
            <ActivityTimeline
                activities={displayActivities}
                savedActivities={activities}
                client={client}
            />
        </div>
    );
}
