import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import React from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { getColumns } from '@/components/reminders/Columns';
import { DataTable } from '@/components/reminders/DataTable';
import { ReminderForm } from '@/components/reminders/reminder-form';
import { SnoozeDialog } from '@/components/reminders/snooze-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { reminderService } from '@/services/reminderService';
import type { BreadcrumbItem, Reminder } from '@/types';

interface RemindersPageProps {
    reminders: Reminder[];
    clients: { id: number; name: string }[];
    activities: { id: number; type: string; summary: string }[];
    filters: { status?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reminders',
        href: '/reminders',
    },
];

export default function RemindersIndex({
    reminders,
    clients,
    activities,
    filters,
}: RemindersPageProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Derived from filters prop, defaults to 'incomplete'
    const status = filters.status || 'incomplete';

    const handleStatusChange = (value: string) => {
        router.get(
            '/reminders',
            { status: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(
        null,
    );
    const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(
        null,
    );
    const [snoozingReminder, setSnoozingReminder] = useState<Reminder | null>(
        null,
    );

    const handleComplete = (reminder: Reminder) => {
        reminderService.complete(reminder.id);
    };

    const handleSnooze = (date: Date) => {
        if (!snoozingReminder) return;
        reminderService.snooze(snoozingReminder.id, date);
        setSnoozingReminder(null);
    };

    const handleDelete = () => {
        if (!deletingReminder) return;
        reminderService.delete(deletingReminder.id, {
            onSuccess: () => setDeletingReminder(null),
        });
    };

    const columns = useMemo(
        () =>
            getColumns({
                onEdit: (reminder) => setEditingReminder(reminder),
                onDelete: (reminder) => setDeletingReminder(reminder),
                onComplete: (reminder) => handleComplete(reminder),
                onSnooze: (reminder) => setSnoozingReminder(reminder),
            }),
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reminders" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Reminders
                        </h1>
                        <p className="text-muted-foreground">
                            Stay on top of your client follow-ups.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Reminder
                    </Button>
                </div>

                <div className="flex items-center space-x-4">
                    <Tabs
                        value={status}
                        onValueChange={handleStatusChange}
                        className="w-[400px]"
                    >
                        <TabsList>
                            <TabsTrigger value="incomplete">
                                Incomplete
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                Completed
                            </TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <DataTable columns={columns} data={reminders} />
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Reminder</DialogTitle>
                        <DialogDescription>
                            Create a reminder for a client, activity, or as a
                            general task.
                        </DialogDescription>
                    </DialogHeader>
                    <ReminderForm
                        clients={clients}
                        activities={activities}
                        onSuccess={() => setIsCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={!!editingReminder}
                onOpenChange={(open) => !open && setEditingReminder(null)}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Reminder</DialogTitle>
                        <DialogDescription>
                            Make changes to your reminder details.
                        </DialogDescription>
                    </DialogHeader>
                    {editingReminder && (
                        <ReminderForm
                            reminder={editingReminder}
                            clients={clients}
                            activities={activities}
                            onSuccess={() => setEditingReminder(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Snooze Dialog */}
            <SnoozeDialog
                open={!!snoozingReminder}
                onOpenChange={(open) => !open && setSnoozingReminder(null)}
                onSnooze={handleSnooze}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingReminder}
                title="Delete Reminder?"
                message="Are you sure you want to delete this reminder? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeletingReminder(null)}
            />
        </AppLayout>
    );
}
