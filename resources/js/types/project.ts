import type { Client } from './client';

export type ProjectStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
    id: number;
    client_id: number;
    client?: Client;
    name: string;
    description?: string;
    start_date: string;
    end_date?: string;
    status: ProjectStatus;
    created_at: string;
    updated_at: string;
}
