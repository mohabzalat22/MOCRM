import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
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
    const columns = useMemo(() => getColumns(), []);

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
    const [snoozingReminder, setSnoozingReminder] = useState<Reminder | null>(
        null,
    );

    const handleSnooze = (date: Date) => {
        if (!snoozingReminder) return;
        reminderService.snooze(snoozingReminder.id, date);
        setSnoozingReminder(null);
    };

    const handleRowClick = (reminder: Reminder) => {
        router.visit(`/reminders/${reminder.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reminders" />

            <div className="mx-auto w-full max-w-[1800px] space-y-6 p-6">
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

                <DataTable
                    columns={columns}
                    data={reminders}
                    status={status}
                    onStatusChange={handleStatusChange}
                    onRowClick={handleRowClick}
                />
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
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

            {/* Snooze Dialog */}
            <SnoozeDialog
                open={!!snoozingReminder}
                onOpenChange={(open) => !open && setSnoozingReminder(null)}
                onSnooze={handleSnooze}
            />
        </AppLayout>
    );
}
