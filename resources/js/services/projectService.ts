import type { RequestPayload } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import type { ProjectStatus, ServiceOptions } from '@/types';

export interface ProjectData {
    client_id: string | number;
    name: string;
    description: string;
    start_date: string;
    end_date?: string;
    status: ProjectStatus;
}

export const projectService = {
    /**
     * Create a new project
     */
    createProject(data: ProjectData, options: ServiceOptions = {}): void {
        router.post('/projects', data as unknown as RequestPayload, {
            ...options,
        });
    },

    /**
     * Update an existing project
     */
    updateProject(id: number, data: ProjectData, options: ServiceOptions = {}): void {
        router.put(`/projects/${id}`, data as unknown as RequestPayload, {
            ...options,
        });
    },

    /**
     * Delete a project
     */
    deleteProject(id: number, options: ServiceOptions = {}): void {
        router.delete(`/projects/${id}`, {
            ...options,
        });
    },
};
