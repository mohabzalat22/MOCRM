import type { Activity } from './activity';
import type { Attachment } from './attachment';
import type { Client } from './client';

export type ProjectStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Task {
    id: number;
    project_id: number;
    description: string;
    due_date?: string;
    start_date?: string;
    assigned_to?: number;
    completed: boolean;
    order: number;
    is_milestone: boolean;
    parent_id?: number;
    completed_at?: string;
    created_at: string;
    updated_at: string;

    // Relationships
    project?: Project;
}

export interface Project {
    id: number;
    name: string;
    description: string | null;
    client_id: number;
    user_id: number;
    status: string;
    start_date: string;
    end_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;

    // Relationships
    client?: Client;
    tasks?: Task[];
    activities?: Activity[];
    attachments?: Attachment[];
    
    // Aggregates
    tasks_count?: number;
    completed_tasks_count?: number;
}
