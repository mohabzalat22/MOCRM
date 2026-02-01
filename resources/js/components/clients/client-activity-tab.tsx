import ActivityTimeline from '@/components/clients/activity-timeline';
import type { Activity } from '@/types';

interface ClientActivityTabProps {
    activities: Activity[];
}

export default function ClientActivityTab({
    activities,
}: ClientActivityTabProps) {
    return (
        <div className="mx-auto max-w-3xl">
            <ActivityTimeline activities={activities} />
        </div>
    );
}
