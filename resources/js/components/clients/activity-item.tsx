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
    ChevronDown,
    ChevronRight,
    RefreshCcw,
    Download,
    FileIcon,
} from 'lucide-react';
import React from 'react';
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

import { useClientStore } from '@/stores/useClientStore';
import type { Activity, ActionItem } from '@/types';
import ActivityForm from './activity-form';

interface ActivityItemProps {
    activity: Activity;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}

export default function ActivityItem({
    activity,
    isExpanded = false,
    onToggleExpand,
}: ActivityItemProps) {
    const { addActivityChange, editMode } = useClientStore();
    const [isEditing, setIsEditing] = React.useState(false);

    const handleDelete = () => {
        addActivityChange({
            type: 'delete',
            activityId: activity.id,
        });
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
            case 'status_change':
                return <RefreshCcw className="h-4 w-4 text-orange-500" />;
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
                if (activity.data?.is_project_update) {
                    return (
                        <div className="mt-1 text-sm text-muted-foreground italic">
                            Project Update
                        </div>
                    );
                }
                return null;
        }
    };

    const renderAttachments = () => {
        if (!activity.attachments || activity.attachments.length === 0)
            return null;

        return (
            <div className="mt-4 space-y-2">
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Attachments
                </p>
                <div className="flex flex-wrap gap-2">
                    {activity.attachments.map((file) => (
                        <a
                            key={file.id}
                            href={route('attachments.download', file.id)}
                            className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-[11px] transition-colors hover:bg-muted"
                        >
                            <FileIcon className="h-3 w-3 text-primary" />
                            <span className="max-w-[120px] truncate font-medium">
                                {file.file_name}
                            </span>
                            <Download className="h-3 w-3 text-muted-foreground" />
                        </a>
                    ))}
                </div>
            </div>
        );
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
                        <div className="flex-1">
                            <div className="flex items-start gap-2">
                                {onToggleExpand && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 flex-shrink-0"
                                        onClick={() => {
                                            onToggleExpand();
                                        }}
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                                <div className="flex-1">
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
                            </div>
                        </div>

                        {editMode && (
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
                        )}
                    </div>

                    {isExpanded && (
                        <div className="animate-in duration-200 slide-in-from-top-2">
                            {formatData()}

                            <div className="mt-2 rounded-md border border-dashed bg-muted/30 p-3 text-sm whitespace-pre-wrap text-muted-foreground">
                                {activity.summary}
                            </div>

                            {renderAttachments()}
                        </div>
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
