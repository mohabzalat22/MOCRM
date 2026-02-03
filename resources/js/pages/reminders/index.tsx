import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import React from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { getColumns } from '@/components/reminders/Columns';
import { DataTable } from '@/components/reminders/DataTable';
import { ReminderForm } from '@/components/reminders/reminder-form';
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
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reminders',
        href: '/reminders',
    },
];

export default function RemindersIndex({ reminders, clients }: RemindersPageProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null);

    const handleDelete = () => {
        if (!deletingReminder) return;
        reminderService.delete(deletingReminder.id, {
            onSuccess: () => setDeletingReminder(null),
        });
    };

    const columns = useMemo(() => getColumns({
        onEdit: (reminder) => setEditingReminder(reminder),
        onDelete: (reminder) => setDeletingReminder(reminder),
    }), []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reminders" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
                        <p className="text-muted-foreground">Stay on top of your client follow-ups.</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Reminder
                    </Button>
                </div>

                <DataTable columns={columns} data={reminders} />
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Reminder</DialogTitle>
                        <DialogDescription>
                            Create a standalone reminder for a client.
                        </DialogDescription>
                    </DialogHeader>
                    <ReminderForm 
                        clients={clients} 
                        onSuccess={() => setIsCreateOpen(false)} 
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingReminder} onOpenChange={(open) => !open && setEditingReminder(null)}>
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
                            onSuccess={() => setEditingReminder(null)} 
                        />
                    )}
                </DialogContent>
            </Dialog>

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

