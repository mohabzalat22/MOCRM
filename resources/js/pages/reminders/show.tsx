import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Clock,
    MoreHorizontal,
    Pencil,
    Trash2,
    CheckCircle2,
    AlertCircle,
    User,
    FileText,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ReminderForm } from '@/components/reminders/reminder-form';
import { SnoozeDialog } from '@/components/reminders/snooze-dialog';
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
import AppLayout from '@/layouts/app-layout';
import { reminderService } from '@/services/reminderService';
import type { BreadcrumbItem, Reminder } from '@/types';

interface ReminderShowProps {
    reminder: Reminder;
    clients: { id: number; name: string }[];
    activities: { id: number; type: string; summary: string }[];
}

const priorityMap = {
    high: {
        label: 'High Priority',
        variant: 'destructive' as const,
        color: 'bg-red-500',
    },
    medium: {
        label: 'Medium Priority',
        variant: 'default' as const,
        color: 'bg-yellow-500',
    },
    low: {
        label: 'Low Priority',
        variant: 'default' as const,
        color: 'bg-green-500',
    },
};

export default function ReminderShow({
    reminder,
    clients,
    activities,
}: ReminderShowProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reminders', href: '/reminders' },
        { title: reminder.title, href: `/reminders/${reminder.id}` },
    ];

    const priority = priorityMap[reminder.priority] || priorityMap.low;
    const isCompleted = !!reminder.completed_at;

    const handleComplete = () => {
        reminderService.complete(reminder.id, {
            onSuccess: () => {
                toast.success('Reminder marked as completed');
            },
        });
    };

    const handleSnooze = (date: Date) => {
        reminderService.snooze(reminder.id, date, {
            onSuccess: () => {
                toast.success('Reminder snoozed successfully');
                setIsSnoozeOpen(false);
            },
        });
    };

    const handleDelete = () => {
        reminderService.delete(reminder.id, {
            onSuccess: () => {
                toast.success('Reminder deleted successfully');
                router.visit('/reminders');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${reminder.title} - Reminder`} />

            <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6 lg:p-8">
                <div className="mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    {reminder.title}
                                </h1>
                                <Badge
                                    className={`${priority.color} text-white transition-opacity hover:opacity-90`}
                                >
                                    {priority.label}
                                </Badge>
                                {isCompleted && (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Completed
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground/80">
                                Scheduled for{' '}
                                {format(
                                    new Date(reminder.reminder_at),
                                    'MMMM d, yyyy h:mm a',
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {!isCompleted && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={handleComplete}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Complete
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => setIsSnoozeOpen(true)}
                                    >
                                        <Clock className="h-4 w-4" />
                                        Snooze
                                    </Button>
                                </>
                            )}
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
                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground/90">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Description
                            </h2>
                            <p className="whitespace-pre-wrap text-muted-foreground">
                                {reminder.description ||
                                    'No description provided.'}
                            </p>
                        </section>

                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground/90">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                Status Information
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">
                                        Status
                                    </span>
                                    <p className="text-sm font-medium text-foreground">
                                        {isCompleted ? 'Completed' : 'Pending'}
                                    </p>
                                </div>
                                {isCompleted && reminder.completed_at && (
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground">
                                            Completed On
                                        </span>
                                        <p className="text-sm font-medium text-foreground">
                                            {format(
                                                new Date(reminder.completed_at),
                                                'MMM d, yyyy h:mm a',
                                            )}
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">
                                        Created
                                    </span>
                                    <p className="text-sm font-medium text-foreground">
                                        {reminder.created_at
                                            ? format(
                                                  new Date(reminder.created_at),
                                                  'MMM d, yyyy',
                                              )
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">
                                        Last Updated
                                    </span>
                                    <p className="text-sm font-medium text-foreground">
                                        {reminder.updated_at
                                            ? format(
                                                  new Date(reminder.updated_at),
                                                  'MMM d, yyyy',
                                              )
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground/90">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Related To
                            </h2>
                            {reminder.remindable ? (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground">
                                            Target
                                        </span>
                                        <p className="text-sm font-semibold text-foreground">
                                            {reminder.remindable.name}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <Link
                                            href={
                                                reminder.remindable_type ===
                                                'App\\Models\\Client'
                                                    ? `/clients/${reminder.remindable_id}`
                                                    : `/projects/${reminder.remindable_id}`
                                            }
                                        >
                                            View{' '}
                                            {reminder.remindable_type ===
                                            'App\\Models\\Client'
                                                ? 'Client'
                                                : 'Activity'}
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    This is a general reminder.
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Reminder</DialogTitle>
                        <DialogDescription>
                            Make changes to your reminder details.
                        </DialogDescription>
                    </DialogHeader>
                    <ReminderForm
                        reminder={reminder}
                        clients={clients}
                        activities={activities}
                        onSuccess={() => setIsEditOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Snooze Dialog */}
            <SnoozeDialog
                open={isSnoozeOpen}
                onOpenChange={setIsSnoozeOpen}
                onSnooze={handleSnooze}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={confirmDelete}
                title="Delete Reminder?"
                message={`Are you sure you want to delete "${reminder.title}"? This action is permanent and cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
            />
        </AppLayout>
    );
}
