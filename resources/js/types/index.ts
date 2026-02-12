export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './activity';
export type * from './client';
export type * from './reminder';
export type * from './project';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
};

export interface Tag {
    id: number;
    name: string;
    color: string;
    usage_count: number;
    created_at: string;
    updated_at: string;
}

export type TaggableType = 'client' | 'project' | 'task';

export interface ServiceOptions {
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
    preserveScroll?: boolean;
    preserveState?: boolean;
}
