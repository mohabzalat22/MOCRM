import { History } from 'lucide-react';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Activity } from '@/types';
import ActivityItem from './activity-item';

interface ActivityTimelineProps {
    activities: Activity[];
}

export default function ActivityTimeline({
    activities,
}: ActivityTimelineProps) {
    if (!activities || activities.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <History className="h-10 w-10 mb-2 opacity-20" />
                    <p>No activity recorded yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Activity Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="flex flex-col">
                    {activities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
