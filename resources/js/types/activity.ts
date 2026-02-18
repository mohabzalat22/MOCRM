import type { User, Tag } from '@/types';
import type { Attachment } from './attachment';
import type { Client } from './client';

export type ActivityType =
    | 'call'
    | 'email'
    | 'meeting'
    | 'note'
    | 'transaction'
    | 'status_change';

export interface ActionItem {
    text: string;
    completed: boolean;
}

export interface ActivityData {
    duration?: string;
    outcome?: string;
    meeting_type?: string;
    attendees?: string;
    action_items?: ActionItem[];
    amount?: string;
    transaction_type?: string;
    old_status?: string;
    new_status?: string;
    is_project_update?: boolean;
    notes?: string;
    [key: string]: unknown;
}

export interface Activity {
    id: number;
    client_id: number;
    project_id?: number;
    user_id: number;
    type: ActivityType;
    summary: string | null;
    data: ActivityData | null;
    created_at: string;
    updated_at: string;
    occurred_at: string;
    user?: User;
    client?: Client;
    attachments?: Attachment[];
    tags?: Tag[];
}
