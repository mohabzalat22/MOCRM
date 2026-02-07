import type { Client } from './client';

export type ProjectStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Task {
    id: number;
    project_id: number;
    description: string;
    due_date?: string;
    assigned_to?: number;
    completed: boolean;
    order: number;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: number;
    client_id: number;
    client?: Client;
    name: string;
    description?: string;
    start_date: string;
    end_date?: string;
    status: ProjectStatus;
    tasks?: Task[];
    tasks_count?: number;
    completed_tasks_count?: number;
    created_at: string;
    updated_at: string;
}
