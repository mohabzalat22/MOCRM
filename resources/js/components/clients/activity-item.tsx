import { router } from '@inertiajs/react';
import {
    Phone,
    Mail,
    Users,
    FileText,
    CreditCard,
    MoreVertical,
    Clock,
    MapPin,
    Video,
    Trash2,
    Edit2,
    CheckCircle2,
    Circle,
} from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Activity, ActionItem } from '@/types';
import ActivityForm from './activity-form';

interface ActivityItemProps {
    activity: Activity;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
    const [isEditing, setIsEditing] = React.useState(false);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this activity?')) {
            router.delete(route('activities.destroy', activity.id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Activity deleted'),
            });
        }
    };

    const getIcon = () => {
        switch (activity.type) {
            case 'call':
                return <Phone className="h-4 w-4 text-blue-500" />;
            case 'email':
                return <Mail className="h-4 w-4 text-green-500" />;
            case 'meeting':
                return <Users className="h-4 w-4 text-purple-500" />;
            case 'transaction':
                return <CreditCard className="h-4 w-4 text-amber-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatData = () => {
        const data = activity.data || {};

        switch (activity.type) {
            case 'call':
                return (
                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                        {data.duration && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {data.duration}
                            </span>
                        )}
                        {data.outcome && (
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />{' '}
                                {data.outcome}
                            </span>
                        )}
                    </div>
                );
            case 'meeting':
                return (
                    <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {data.meeting_type && (
                                <span className="flex items-center gap-1">
                                    {data.meeting_type === 'Video' ? (
                                        <Video className="h-3 w-3" />
                                    ) : (
                                        <MapPin className="h-3 w-3" />
                                    )}
                                    {data.meeting_type}
                                </span>
                            )}
                            {data.duration && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />{' '}
                                    {data.duration}
                                </span>
                            )}
                            {data.attendees && (
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />{' '}
                                    {data.attendees}
                                </span>
                            )}
                        </div>
                        {data.action_items && data.action_items.length > 0 && (
                            <div className="space-y-1 border-l-2 border-muted pl-2">
                                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Action Items
                                </p>
                                {data.action_items.map(
                                    (item: ActionItem, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            {item.completed ? (
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Circle className="h-3 w-3 text-muted-foreground" />
                                            )}
                                            <span
                                                className={
                                                    item.completed
                                                        ? 'text-muted-foreground line-through'
                                                        : ''
                                                }
                                            >
                                                {item.text}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'transaction':
                return (
                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                        {data.transaction_type && (
                            <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                                {data.transaction_type}
                            </span>
                        )}
                        {data.amount && (
                            <span className="font-semibold text-foreground">
                                {data.amount}
                            </span>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <div className="relative pb-8 pl-8 last:pb-0">
                {/* Timeline Line */}
                <div className="absolute top-6 bottom-0 left-[15px] w-px bg-border last:hidden" />

                {/* Timeline Node */}
                <div className="absolute top-1 left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm">
                    {getIcon()}
                </div>

                <div className="group relative">
                    <div className="mb-1 flex items-start justify-between p-2">
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">
                                {activity.summary}
                            </h4>
                            <div className="mt-1.5 flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {new Date(
                                        activity.created_at,
                                    ).toLocaleString([], {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </span>
                                {activity.user && (
                                    <span className="text-xs text-muted-foreground">
                                        • by {activity.user.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="gap-2"
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <Edit2 className="h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DropdownMenuItem
                                    className="gap-2 text-destructive"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {formatData()}

                    {activity.data?.notes && (
                        <p className="mt-2 rounded-md border border-dashed bg-muted/30 p-2 text-sm text-muted-foreground whitespace-pre-wrap">
                            {activity.data.notes}
                        </p>
                    )}
                </div>

                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Activity</DialogTitle>
                        <DialogDescription>
                            Make changes to your activity log here.
                        </DialogDescription>
                    </DialogHeader>
                    <ActivityForm
                        clientId={activity.client_id}
                        activity={activity}
                        onSuccess={() => setIsEditing(false)}
                    />
                </DialogContent>
            </div>
        </Dialog>
    );
}
