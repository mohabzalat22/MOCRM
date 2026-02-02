export type ActivityType =
    | 'note'
    | 'call'
    | 'email'
    | 'meeting'
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
    transaction_type?: string;
    amount?: string;
    notes?: string;
    [key: string]: unknown;
}

export interface Activity {
    id: number;
    client_id: string | number;
    type: ActivityType;
    summary: string;
    data: ActivityData;
    created_at: string;
    user?: {
        name: string;
    };
}
