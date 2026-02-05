export interface Reminder {
    id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    reminder_at: string;
    remindable?: {
        id: number;
        name: string;
    };
    remindable_id?: number | string;
    remindable_type?: string;
    completed_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateReminderData {
    title: string;
    description?: string;
    priority: Reminder['priority'];
    reminder_at: string;
    remindable_id?: number | string | null;
    remindable_type?: string | null;
}

export interface UpdateReminderData {
    title: string;
    description?: string;
    priority: Reminder['priority'];
    reminder_at: string;
    remindable_id?: number | string | null;
    remindable_type?: string | null;
}

export interface ServiceOptions {
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
}
