import type { RequestPayload } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import type { 
    CreateReminderData, 
    UpdateReminderData, 
    ServiceOptions 
} from '@/types';

export const reminderService = {
    /**
     * Create a new reminder
     */
    create(data: CreateReminderData, { onSuccess, onError }: ServiceOptions = {}): void {
        router.post('/reminders', data as unknown as RequestPayload, {
            preserveScroll: true,
            onSuccess,
            onError,
        });
    },

    /**
     * Update an existing reminder
     */
    update(id: number, data: UpdateReminderData, { onSuccess, onError }: ServiceOptions = {}): void {
        router.patch(`/reminders/${id}`, data as unknown as RequestPayload, {
            preserveScroll: true,
            onSuccess,
            onError,
        });
    },

    /**
     * Delete a reminder
     */
    delete(id: number, { onSuccess, onError }: ServiceOptions = {}): void {
        router.delete(`/reminders/${id}`, {
            preserveScroll: true,
            onSuccess,
            onError,
        });
    },

    /**
     * Mark a reminder as complete
     */
    complete(id: number, { onSuccess, onError }: ServiceOptions = {}): void {
        router.put(`/reminders/${id}/complete`, {}, {
            preserveScroll: true,
            onSuccess,
            onError,
        });
    },

    /**
     * Snooze a reminder
     */
    snooze(id: number, date: Date, { onSuccess, onError }: ServiceOptions = {}): void {
        router.put(`/reminders/${id}/snooze`, {
            reminder_at: date.toISOString(),
        } as unknown as RequestPayload, {
            preserveScroll: true,
            onSuccess,
            onError,
        });
    },

    /**
     * Perform bulk action on reminders
     */
    bulkAction(action: 'complete' | 'delete', ids: number[], { onSuccess, onError }: ServiceOptions = {}): void {
        router.post('/reminders/bulk-action', {
            action,
            ids,
        } as unknown as RequestPayload, {
            preserveScroll: true,
            onSuccess,
            onError,
        });
    },
};
