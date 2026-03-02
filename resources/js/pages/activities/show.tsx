import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    Phone,
    Mail,
    Users,
    FileText,
    CreditCard,
    RefreshCcw,
    Clock,
    MapPin,
    Video,
    CheckCircle2,
    Circle,
    MoreHorizontal,
    Pencil,
    Trash2,
    Download,
    FileIcon,
    User,
    Calendar,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ActivityForm from '@/components/clients/activity-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Markdown } from '@/components/ui/markdown';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Activity, ActionItem } from '@/types';

interface ActivityShowProps {
    activity: Activity;
    clients: { id: number; name: string }[];
    activityTypes: string[];
    projectStatuses: string[];
}

const typeIcons: Record<string, React.ElementType> = {
    call: Phone,
    email: Mail,
    meeting: Users,
    note: FileText,
    transaction: CreditCard,
    status_change: RefreshCcw,
};

const typeColors: Record<string, string> = {
    call: 'bg-blue-100 text-blue-800 border-blue-200',
    email: 'bg-green-100 text-green-800 border-green-200',
    meeting: 'bg-purple-100 text-purple-800 border-purple-200',
    note: 'bg-orange-100 text-orange-800 border-orange-200',
    transaction: 'bg-amber-100 text-amber-800 border-amber-200',
    status_change: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ActivityShow({ activity }: ActivityShowProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Activities', href: '/activities' },
        {
            title: activity.summary || 'Activity Details',
            href: `/activities/${activity.id}`,
        },
    ];

    const Icon = typeIcons[activity.type] || FileText;
    const colorClass = typeColors[activity.type] || '';

    const handleDelete = () => {
        router.delete(`/activities/${activity.id}`, {
            onSuccess: () => {
                toast.success('Activity deleted successfully');
                router.visit('/activities');
            },
            onError: () => {
                toast.error('Failed to delete activity');
            },
        });
    };

    const renderDataFields = () => {
        const data = activity.data || {};

        return (
            <div className="grid gap-4 sm:grid-cols-2">
                {activity.type === 'call' && (
                    <>
                        {data.duration && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Duration
                                </span>
                                <p className="flex items-center gap-1 text-sm font-medium">
                                    <Clock className="h-3.5 w-3.5" />{' '}
                                    {data.duration}
                                </p>
                            </div>
                        )}
                        {data.outcome && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Outcome
                                </span>
                                <p className="flex items-center gap-1 text-sm font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5" />{' '}
                                    {data.outcome}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {activity.type === 'meeting' && (
                    <>
                        {data.meeting_type && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Meeting Type
                                </span>
                                <p className="flex items-center gap-1 text-sm font-medium">
                                    {data.meeting_type === 'Video' ? (
                                        <Video className="h-3.5 w-3.5" />
                                    ) : (
                                        <MapPin className="h-3.5 w-3.5" />
                                    )}
                                    {data.meeting_type}
                                </p>
                            </div>
                        )}
                        {data.duration && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Duration
                                </span>
                                <p className="flex items-center gap-1 text-sm font-medium">
                                    <Clock className="h-3.5 w-3.5" />{' '}
                                    {data.duration}
                                </p>
                            </div>
                        )}
                        {data.attendees && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Attendees
                                </span>
                                <p className="flex items-center gap-1 text-sm font-medium">
                                    <Users className="h-3.5 w-3.5" />{' '}
                                    {data.attendees}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {activity.type === 'transaction' && (
                    <>
                        {data.transaction_type && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Transaction Type
                                </span>
                                <p className="text-sm font-medium">
                                    <Badge
                                        variant="outline"
                                        className="border-amber-200 bg-amber-50 text-amber-700"
                                    >
                                        {data.transaction_type}
                                    </Badge>
                                </p>
                            </div>
                        )}
                        {data.amount && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Amount
                                </span>
                                <p className="text-sm font-bold text-foreground">
                                    {data.amount}
                                </p>
                            </div>
                        )}
                    </>
                )}

                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                        Date & Time
                    </span>
                    <p className="flex items-center gap-1 text-sm font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(
                            parseISO(
                                activity.occurred_at || activity.created_at,
                            ),
                            'MMMM d, yyyy h:mm a',
                        )}
                    </p>
                </div>

                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                        Created By
                    </span>
                    <p className="flex items-center gap-1 text-sm font-medium">
                        <User className="h-3.5 w-3.5" />
                        {activity.user?.name || 'Unknown'}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${activity.summary || 'Activity'} - Activity`} />

            <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6 lg:p-8">
                <div className="mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    {activity.summary || 'Activity'}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={`${colorClass} transition-opacity`}
                                >
                                    <Icon className="mr-1.5 h-3.5 w-3.5" />
                                    {activity.type.charAt(0).toUpperCase() +
                                        activity.type
                                            .slice(1)
                                            .replace('_', ' ')}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => setIsEditOpen(true)}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setConfirmDelete(true)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        {/* Dynamic Data Fields */}
                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-semibold text-foreground/90">
                                Details
                            </h2>
                            {renderDataFields()}
                        </section>

                        {/* Action Items for meetings */}
                        {activity.type === 'meeting' &&
                            activity.data?.action_items &&
                            (activity.data.action_items as ActionItem[])
                                .length > 0 && (
                                <section className="rounded-xl border bg-card p-6 shadow-sm">
                                    <h2 className="mb-4 text-base font-semibold text-foreground/90">
                                        Action Items
                                    </h2>
                                    <div className="space-y-2">
                                        {(
                                            activity.data
                                                .action_items as ActionItem[]
                                        ).map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 text-sm"
                                            >
                                                {item.completed ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-muted-foreground" />
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
                                        ))}
                                    </div>
                                </section>
                            )}

                        {/* Notes */}
                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-semibold text-foreground/90">
                                Notes
                            </h2>
                            <Markdown
                                content={String(
                                    activity.data?.notes ||
                                        'No description provided.',
                                )}
                                className="text-muted-foreground"
                            />
                        </section>

                        {/* Tags */}
                        {activity.tags && activity.tags.length > 0 && (
                            <section className="rounded-xl border bg-card p-6 shadow-sm">
                                <h2 className="mb-4 text-base font-semibold text-foreground/90">
                                    Tags
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {activity.tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="px-2.5 py-0.5 text-xs font-medium"
                                            style={{
                                                backgroundColor: `${tag.color}20`,
                                                color: tag.color,
                                                borderColor: `${tag.color}40`,
                                            }}
                                        >
                                            <div
                                                className="mr-1.5 h-2 w-2 rounded-full"
                                                style={{
                                                    backgroundColor: tag.color,
                                                }}
                                            />
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Related To */}
                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-semibold text-foreground/90">
                                Related To
                            </h2>
                            <div className="space-y-4">
                                {activity.client && (
                                    <div className="space-y-2">
                                        <span className="text-xs text-muted-foreground">
                                            Client
                                        </span>
                                        <div className="rounded-lg border bg-muted/30 p-3">
                                            <Link
                                                href={`/clients/${activity.client.id}`}
                                                className="text-sm font-semibold text-primary hover:underline"
                                            >
                                                {activity.client.name}
                                            </Link>
                                            {activity.client.company_name && (
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {
                                                        activity.client
                                                            .company_name
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activity.project && (
                                    <div className="space-y-2">
                                        <span className="text-xs text-muted-foreground">
                                            Project
                                        </span>
                                        <div className="rounded-lg border bg-muted/30 p-3">
                                            <Link
                                                href={`/projects/${activity.project.id}`}
                                                className="text-sm font-semibold text-primary hover:underline"
                                            >
                                                {activity.project.name}
                                            </Link>
                                            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span>
                                                    Status:{' '}
                                                    {activity.project.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Attachments */}
                        {activity.attachments &&
                            activity.attachments.length > 0 && (
                                <section className="rounded-xl border bg-card p-6 shadow-sm">
                                    <h2 className="mb-4 text-base font-semibold text-foreground/90">
                                        Attachments
                                    </h2>
                                    <div className="space-y-2">
                                        {activity.attachments.map((file) => (
                                            <a
                                                key={file.id}
                                                href={`/attachments/${file.id}/download`}
                                                className="flex items-center justify-between rounded-lg border bg-background p-2.5 text-sm transition-colors hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileIcon className="h-4 w-4 shrink-0 text-primary" />
                                                    <span className="truncate font-medium">
                                                        {file.file_name}
                                                    </span>
                                                </div>
                                                <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Edit Activity</DialogTitle>
                        <DialogDescription>
                            Update the activity details below.
                        </DialogDescription>
                    </DialogHeader>
                    <ActivityForm
                        activity={activity}
                        clientId={activity.client_id}
                        onSuccess={() => setIsEditOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={confirmDelete}
                title="Delete Activity?"
                message={`Are you sure you want to delete this activity? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
            />
        </AppLayout>
    );
}
