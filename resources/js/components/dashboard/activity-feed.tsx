import { Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    Activity as ActivityIcon,
    User,
    Clock,
    ExternalLink,
    Calendar,
    Phone,
    Mail,
    FileText,
    Repeat,
} from 'lucide-react';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Activity, ActivityType } from '@/types';

interface ActivityFeedProps {
    activities: Activity[];
}

const getActivityIcon = (type: ActivityType) => {
    switch (type) {
        case 'call':
            return <Phone className="h-3.5 w-3.5 text-blue-500" />;
        case 'email':
            return <Mail className="h-3.5 w-3.5 text-purple-500" />;
        case 'meeting':
            return <Calendar className="h-3.5 w-3.5 text-green-500" />;
        case 'note':
            return <FileText className="h-3.5 w-3.5 text-amber-500" />;
        case 'transaction':
            return <Repeat className="h-3.5 w-3.5 text-emerald-500" />;
        case 'status_change':
            return <ActivityIcon className="h-3.5 w-3.5 text-slate-500" />;
        default:
            return (
                <ActivityIcon className="h-3.5 w-3.5 text-muted-foreground" />
            );
    }
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['recentActivities'],
            });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="flex h-full flex-col overflow-hidden border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <ActivityIcon className="h-4 w-4 text-primary" />
                    Global Activity Feed
                </CardTitle>
                <span className="text-[10px] font-normal text-muted-foreground">
                    Real-time updates
                </span>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ActivityIcon className="mb-2 h-8 w-8 text-muted-foreground/50" />
                        <p className="px-4 text-sm text-muted-foreground">
                            No recent activities recorded.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="group p-4 transition-all hover:bg-muted/50"
                            >
                                <div className="flex gap-3">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm leading-none font-medium">
                                                {activity.summary ||
                                                    'New activity'}
                                            </p>
                                            <span className="shrink-0 text-[10px] font-medium text-muted-foreground uppercase">
                                                {activity.type.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            {activity.client && (
                                                <Link
                                                    href={`/clients/${activity.client_id}`}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:text-primary/80 hover:underline"
                                                >
                                                    <User className="h-3 w-3" />
                                                    {activity.client.name}
                                                    <ExternalLink className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                                </Link>
                                            )}
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            activity.created_at,
                                                        ),
                                                    )}{' '}
                                                    ago
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
